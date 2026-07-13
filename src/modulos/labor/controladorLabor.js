/**
 * Caso de uso implementado: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos funcionales relacionados: RF5, RF10, RF18, RF23, RF28
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Labores / API REST
 * Patrones de diseño utilizados: Singleton (Controlador único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de labores)
 */

const loggerAuditoria = require("../../configuracion/logger");
const ServicioLabor = require("./servicioLabor");

class ControladorLabor {
    /**
     * @private
     * @type {ControladorLabor}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorLabor.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioLabor = new ServicioLabor();
        ControladorLabor.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única de control.
     */
    static obtenerInstancia() {
        if (!ControladorLabor.#instanciaUnica) {
            new ControladorLabor();
        }
        return ControladorLabor.#instanciaUnica;
    }

    /**
     * Objetivo: Crear una labor con validaciones institucionales.
     * Reglas de negocio aplicadas: RN-Labor-01 (Nombre único), RN-Labor-02 (Horas semanales > 0).
     */
    async crearLabor(peticion, respuesta) {
        const { nombre, descripcion, horas_semanales } = peticion.body;

        try {
            // 1. RN-Labor-02: Validar horas semanales > 0
            if (parseInt(horas_semanales) <= 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: Las horas semanales de labor deben ser un número entero estrictamente mayor que cero."
                });
            }

            // 2. RN-Labor-01: Validar duplicidad
            const laborDuplicada = await this.servicioLabor.buscarPorNombre(nombre);
            if (laborDuplicada) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: `La labor académica '${nombre}' ya se encuentra registrada.`
                });
            }

            const laborCreada = await this.servicioLabor.crearLabor({
                nombre,
                descripcion,
                horas_semanales: parseInt(horas_semanales)
            });

            loggerAuditoria.info(`Labor creada exitosamente: ${nombre}.`);

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Labor académica creada con éxito.",
                labor: laborCreada
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en crearLabor: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al crear labor académica."
            });
        }
    }

    /**
     * Objetivo: Listar todas las labores.
     */
    async listarLabores(peticion, respuesta) {
        try {
            const labores = await this.servicioLabor.listarTodas();
            return respuesta.status(200).json({
                exitoso: true,
                labores
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarLabores: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar labores académicas."
            });
        }
    }

    /**
     * Objetivo: Buscar labor por ID.
     */
    async buscarLaborPorId(peticion, respuesta) {
        const idLabor = parseInt(peticion.params.id);

        try {
            const labor = await this.servicioLabor.buscarPorId(idLabor);
            if (!labor) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Labor académica no encontrada."
                });
            }

            return respuesta.status(200).json({
                exitoso: true,
                labor
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en buscarLaborPorId: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al buscar labor académica."
            });
        }
    }

    /**
     * Objetivo: Actualizar labor.
     */
    async actualizarLabor(peticion, respuesta) {
        const idLabor = parseInt(peticion.params.id);
        const { nombre, descripcion, horas_semanales } = peticion.body;

        try {
            const laborExistente = await this.servicioLabor.buscarPorId(idLabor);
            if (!laborExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Labor académica no encontrada."
                });
            }

            if (horas_semanales !== undefined && parseInt(horas_semanales) <= 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: Las horas semanales deben ser mayores a cero."
                });
            }

            if (nombre && nombre.trim() !== laborExistente.nombre) {
                const laborDuplicada = await this.servicioLabor.buscarPorNombre(nombre);
                if (laborDuplicada) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: "El nombre de la labor ya se encuentra registrado en otra actividad."
                    });
                }
            }

            const laborActualizada = await this.servicioLabor.actualizarLabor(idLabor, {
                nombre,
                descripcion,
                horas_semanales: horas_semanales ? parseInt(horas_semanales) : undefined
            });

            loggerAuditoria.info(`Labor ID ${idLabor} actualizada con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Labor académica actualizada con éxito.",
                labor: laborActualizada
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en actualizarLabor: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al actualizar labor académica."
            });
        }
    }

    /**
     * Objetivo: Eliminar labor.
     * Reglas de negocio aplicadas: RN-Labor-03 (No eliminar si tiene horarios asignados).
     */
    async eliminarLabor(peticion, respuesta) {
        const idLabor = parseInt(peticion.params.id);

        try {
            const laborExistente = await this.servicioLabor.buscarPorId(idLabor);
            if (!laborExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Labor académica no encontrada."
                });
            }

            const tieneHorarios = await this.servicioLabor.tieneHorariosAsociados(idLabor);
            if (tieneHorarios) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "Restricción de integridad: No se puede eliminar la labor porque cuenta con horarios asignados."
                });
            }

            await this.servicioLabor.eliminarLabor(idLabor);

            loggerAuditoria.info(`Labor ID ${idLabor} eliminada con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Labor académica de forma física eliminada con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarLabor: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar labor académica."
            });
        }
    }
}

module.exports = ControladorLabor;
