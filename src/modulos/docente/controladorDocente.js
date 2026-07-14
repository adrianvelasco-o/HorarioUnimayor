/**
 * Caso de uso implementado: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos funcionales relacionados: RF6, RF12, RF16, RF22, RF27
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Docentes / API REST
 * Patrones de diseño utilizados: Singleton (Controlador único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de docentes)
 */

const loggerAuditoria = require("../../configuracion/logger");
const FabricaUsuarios = require("../autenticacion/fabricaUsuarios");
const ServicioDocente = require("./servicioDocente");

class ControladorDocente {
    /**
     * @private
     * @type {ControladorDocente}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorDocente.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioDocente = new ServicioDocente();
        ControladorDocente.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única de control.
     * Parámetros: Ninguno.
     * Valor retornado: {ControladorDocente} Instancia única.
     */
    static obtenerInstancia() {
        if (!ControladorDocente.#instanciaUnica) {
            new ControladorDocente();
        }
        return ControladorDocente.#instanciaUnica;
    }

    /**
     * Objetivo: Crear un docente atómicamente.
     */
    async crearDocente(peticion, respuesta) {
        const { nombres, apellidos, correo, contrasena, id_rol, identificacion, telefono, horas_semanales_maximas, tipo_contrato } = peticion.body;

        try {
            // 1. Validar si ya existe la identificación
            const docenteExistente = await this.servicioDocente.buscarPorIdentificacion(identificacion);
            if (docenteExistente) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "La identificación ya se encuentra registrada (ya está registrada)."
                });
            }

            let rolIdFinal = id_rol;
            if (!rolIdFinal) {
                const rolDocente = await this.servicioDocente.obtenerRolPorNombre("Docente");
                if (!rolDocente) {
                    return respuesta.status(400).json({
                        exitoso: false,
                        mensaje: "No se encontró el rol de Docente en la base de datos."
                    });
                }
                rolIdFinal = rolDocente.id_rol;
            }

            // 2. Usar Factory Method para validar y construir el objeto de negocio
            const usuarioConstruido = await FabricaUsuarios.crearUsuario("DOCENTE", {
                nombres,
                apellidos,
                correo,
                contrasena,
                id_rol: rolIdFinal
            });

            // 3. Persistir atómicamente en PostgreSQL mediante transacción
            const docenteCreado = await this.servicioDocente.crearDocente({
                nombres: usuarioConstruido.nombres,
                apellidos: usuarioConstruido.apellidos,
                correo: usuarioConstruido.correo,
                contrasena: usuarioConstruido.contrasena,
                id_rol: rolIdFinal,
                identificacion,
                telefono,
                horas_semanales_maximas,
                tipo_contrato
            });

            loggerAuditoria.info(`Docente registrado con éxito: ${correo}.`);

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Docente registrado con éxito.",
                docente: {
                    id_docente: docenteCreado.id_docente,
                    identificacion: docenteCreado.identificacion,
                    horas_semanales_maximas: docenteCreado.horas_semanales_maximas,
                    tipo_contrato: docenteCreado.tipo_contrato,
                    usuario: {
                        nombres: docenteCreado.usuario.nombres,
                        apellidos: docenteCreado.usuario.apellidos,
                        correo: docenteCreado.usuario.correo
                    }
                }
            });

        } catch (errorExcepcion) {
            // Registrar el error completo únicamente en el servidor mediante el logger
            loggerAuditoria.error(`Error inesperado en crearDocente: ${errorExcepcion.stack || errorExcepcion.message}`);

            // Caso 1: Si Prisma devuelve una violación de clave única sobre el correo
            if (
                errorExcepcion.code === 'P2002' && 
                errorExcepcion.meta && 
                (Array.isArray(errorExcepcion.meta.target) ? errorExcepcion.meta.target.includes('correo') : typeof errorExcepcion.meta.target === 'string' && errorExcepcion.meta.target.includes('correo'))
            ) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "El correo institucional ya está registrado para otro usuario. Si la persona ya existe en el sistema, modifique sus datos desde Gestión de Usuarios."
                });
            }

            // Fallback para comprobar mensaje de Prisma si el código P2002 no está presente pero refiere al correo único
            if (errorExcepcion.message && errorExcepcion.message.includes("correo") && (errorExcepcion.message.includes("Unique constraint failed") || errorExcepcion.message.includes("Clave única"))) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "El correo institucional ya está registrado para otro usuario. Si la persona ya existe en el sistema, modifique sus datos desde Gestión de Usuarios."
                });
            }

            // Caso 3: Para cualquier otro error inesperado
            return respuesta.status(400).json({
                exitoso: false,
                mensaje: "Ocurrió un error al registrar el docente. Intente nuevamente o contacte al administrador."
            });
        }
    }

    /**
     * Objetivo: Listar todos los docentes de la institución.
     */
    async listarDocentes(peticion, respuesta) {
        try {
            const docentes = await this.servicioDocente.listarTodos();
            return respuesta.status(200).json({
                exitoso: true,
                docentes
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarDocentes: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar docentes."
            });
        }
    }

    /**
     * Objetivo: Buscar docente por su ID.
     */
    async buscarDocentePorId(peticion, respuesta) {
        const idDocente = parseInt(peticion.params.id);

        try {
            const docente = await this.servicioDocente.buscarPorId(idDocente);
            if (!docente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Docente no encontrado."
                });
            }

            return respuesta.status(200).json({
                exitoso: true,
                docente
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en buscarDocentePorId: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al buscar docente."
            });
        }
    }

    /**
     * Objetivo: Actualizar perfil de docente.
     */
    async actualizarDocente(peticion, respuesta) {
        const idDocente = parseInt(peticion.params.id);
        const { nombres, apellidos, correo, identificacion, telefono, horas_semanales_maximas, tipo_contrato } = peticion.body;

        try {
            const docenteExistente = await this.servicioDocente.buscarPorId(idDocente);
            if (!docenteExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Docente no encontrado."
                });
            }

            // Validar no duplicar identificación
            if (identificacion && identificacion.trim() !== docenteExistente.identificacion) {
                const idDuplicado = await this.servicioDocente.buscarPorIdentificacion(identificacion);
                if (idDuplicado) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: "La identificación ya se encuentra registrada en otro docente."
                    });
                }
            }

            const docenteActualizado = await this.servicioDocente.actualizarDocente(idDocente, {
                nombres,
                apellidos,
                correo,
                identificacion,
                telefono,
                horas_semanales_maximas,
                tipo_contrato
            });

            loggerAuditoria.info(`Docente ID ${idDocente} actualizado exitosamente.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Docente actualizado con éxito.",
                docente: docenteActualizado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en actualizarDocente: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al actualizar docente."
            });
        }
    }

    /**
     * Objetivo: Eliminar un docente (sólo si no tiene horarios programados).
     */
    async eliminarDocente(peticion, respuesta) {
        const idDocente = parseInt(peticion.params.id);

        try {
            const docenteExistente = await this.servicioDocente.buscarPorId(idDocente);
            if (!docenteExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Docente no encontrado."
                });
            }

            // RN-Docente-03: Validar que no tenga horarios
            const tieneHorarios = await this.servicioDocente.tieneHorariosAsociados(idDocente);
            if (tieneHorarios) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "Restricción de integridad: No se puede eliminar el docente porque cuenta con horarios asignados."
                });
            }

            await this.servicioDocente.eliminarDocente(idDocente);

            loggerAuditoria.info(`Docente ID ${idDocente} eliminado con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Docente eliminado con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarDocente: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar docente."
            });
        }
    }
}

module.exports = ControladorDocente;
