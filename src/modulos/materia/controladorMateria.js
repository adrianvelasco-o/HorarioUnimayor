/**
 * Caso de uso implementado: UC-30 al UC-34 (Gestión de Materias)
 * Requisitos funcionales relacionados: RF8, RF14, RF19, RF24, RF29
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Materias / API REST
 * Patrones de diseño utilizados: Singleton (Controlador único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de materias)
 */

const loggerAuditoria = require("../../configuracion/logger");
const ServicioMateria = require("./servicioMateria");

class ControladorMateria {
    /**
     * @private
     * @type {ControladorMateria}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorMateria.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioMateria = new ServicioMateria();
        ControladorMateria.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única de control.
     */
    static obtenerInstancia() {
        if (!ControladorMateria.#instanciaUnica) {
            new ControladorMateria();
        }
        return ControladorMateria.#instanciaUnica;
    }

    /**
     * Objetivo: Crear una materia con validaciones institucionales.
     * Reglas de negocio aplicadas: RN-Materia-01 (Código único), RN-Materia-02 (Nombre único), RN-Materia-03 (Horas/Créditos > 0).
     */
    async crearMateria(peticion, respuesta) {
        const { codigo, nombre, creditos, horas_semanales } = peticion.body;

        try {
            // 1. RN-Materia-03: Validar horas/créditos > 0
            if (parseInt(creditos) <= 0 || parseInt(horas_semanales) <= 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: Los créditos y las horas semanales deben ser enteros mayores que cero."
                });
            }

            // 2. RN-Materia-01: Validar código duplicado
            const codigoDuplicado = await this.servicioMateria.buscarPorCodigo(codigo);
            if (codigoDuplicado) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: `El código de materia '${codigo}' ya se encuentra registrado.`
                });
            }

            // 3. RN-Materia-02: Validar nombre duplicado
            const nombreDuplicado = await this.servicioMateria.buscarPorNombre(nombre);
            if (nombreDuplicado) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: `La materia '${nombre}' ya se encuentra registrada.`
                });
            }

            const materiaCreada = await this.servicioMateria.crearMateria({
                codigo,
                nombre,
                creditos: parseInt(creditos),
                horas_semanales: parseInt(horas_semanales)
            });

            loggerAuditoria.info(`Materia creada exitosamente: ${nombre}.`);

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Materia creada con éxito.",
                materia: materiaCreada
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en crearMateria: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al crear materia."
            });
        }
    }

    /**
     * Objetivo: Listar todas las materias.
     */
    async listarMaterias(peticion, respuesta) {
        try {
            const materias = await this.servicioMateria.listarTodas();
            return respuesta.status(200).json({
                exitoso: true,
                materias
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarMaterias: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar materias."
            });
        }
    }

    /**
     * Objetivo: Buscar materia por ID.
     */
    async buscarMateriaPorId(peticion, respuesta) {
        const idMateria = parseInt(peticion.params.id);

        try {
            const materia = await this.servicioMateria.buscarPorId(idMateria);
            if (!materia) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Materia no encontrada."
                });
            }

            return respuesta.status(200).json({
                exitoso: true,
                materia
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en buscarMateriaPorId: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al buscar materia."
            });
        }
    }

    /**
     * Objetivo: Actualizar materia.
     */
    async actualizarMateria(peticion, respuesta) {
        const idMateria = parseInt(peticion.params.id);
        const { codigo, nombre, creditos, horas_semanales } = peticion.body;

        try {
            const materiaExistente = await this.servicioMateria.buscarPorId(idMateria);
            if (!materiaExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Materia no encontrada."
                });
            }

            if ((creditos !== undefined && parseInt(creditos) <= 0) || (horas_semanales !== undefined && parseInt(horas_semanales) <= 0)) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: Los créditos y las horas semanales deben ser mayores a cero."
                });
            }

            if (codigo && codigo.trim().toUpperCase() !== materiaExistente.codigo) {
                const codigoDuplicado = await this.servicioMateria.buscarPorCodigo(codigo);
                if (codigoDuplicado) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: "El código de la materia ya se encuentra registrado."
                    });
                }
            }

            if (nombre && nombre.trim() !== materiaExistente.nombre) {
                const nombreDuplicado = await this.servicioMateria.buscarPorNombre(nombre);
                if (nombreDuplicado) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: "El nombre de la materia ya se encuentra registrado."
                    });
                }
            }

            const materiaActualizada = await this.servicioMateria.actualizarMateria(idMateria, {
                codigo,
                nombre,
                creditos: creditos ? parseInt(creditos) : undefined,
                horas_semanales: horas_semanales ? parseInt(horas_semanales) : undefined
            });

            loggerAuditoria.info(`Materia ID ${idMateria} actualizada con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Materia actualizada con éxito.",
                materia: materiaActualizada
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en actualizarMateria: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al actualizar materia."
            });
        }
    }

    /**
     * Objetivo: Eliminar materia.
     * Reglas de negocio aplicadas: RN-Materia-04 (No borrar si tiene horarios vinculados).
     */
    async eliminarMateria(peticion, respuesta) {
        const idMateria = parseInt(peticion.params.id);

        try {
            const materiaExistente = await this.servicioMateria.buscarPorId(idMateria);
            if (!materiaExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Materia no encontrada."
                });
            }

            const tieneHorarios = await this.servicioMateria.tieneHorariosAsociados(idMateria);
            if (tieneHorarios) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "Restricción de integridad: No se puede eliminar la materia porque cuenta con horarios asignados."
                });
            }

            await this.servicioMateria.eliminarMateria(idMateria);

            loggerAuditoria.info(`Materia ID ${idMateria} eliminada con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Materia eliminada con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarMateria: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar materia."
            });
        }
    }
}

module.exports = ControladorMateria;
