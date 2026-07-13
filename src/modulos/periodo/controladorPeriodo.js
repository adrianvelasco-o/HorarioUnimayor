/**
 * Caso de uso implementado: UC-9, UC-10, UC-11, UC-12, UC-13 (Gestión de Periodos Académicos)
 * Requisitos funcionales relacionados: RF3, RF11, RF15, RF20, RF25
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Periodos / API REST
 * Patrones de diseño utilizados: Singleton (Instancia única de control)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de periodos)
 */

const loggerAuditoria = require("../../configuracion/logger");
const ServicioPeriodo = require("./servicioPeriodo");

class ControladorPeriodo {
    /**
     * @private
     * @type {ControladorPeriodo}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorPeriodo.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioPeriodo = new ServicioPeriodo();
        ControladorPeriodo.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única de control.
     * Parámetros: Ninguno.
     * Valor retornado: {ControladorPeriodo} Instancia única.
     */
    static obtenerInstancia() {
        if (!ControladorPeriodo.#instanciaUnica) {
            new ControladorPeriodo();
        }
        return ControladorPeriodo.#instanciaUnica;
    }

    /**
     * Objetivo: Crear un nuevo periodo académico con validaciones institucionales.
     * Parámetros:
     *   - peticion: {Object} Petición HTTP de Express (nombre, fecha_inicio, fecha_fin).
     *   - respuesta: {Object} Respuesta HTTP de Express.
     * Valor retornado: {Promise<Object>} JSON con el periodo creado.
     */
    async crearPeriodo(peticion, respuesta) {
        const { nombre, fecha_inicio, fecha_fin, activo } = peticion.body;

        try {
            // 1. RN-Periodo-02: Validar que fecha_inicio sea menor que fecha_fin
            const fechaInicioDate = new Date(fecha_inicio);
            const fechaFinDate = new Date(fecha_fin);

            if (fechaInicioDate >= fechaFinDate) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: La fecha de inicio debe ser estrictamente anterior a la fecha de fin."
                });
            }

            // 2. RN-Periodo-01: Validar duplicidad
            const periodoDuplicado = await this.servicioPeriodo.buscarPorNombre(nombre);
            if (periodoDuplicado) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: `El periodo académico '${nombre}' ya se encuentra registrado.`
                });
            }

            const periodoCreado = await this.servicioPeriodo.crearPeriodo({
                nombre,
                fecha_inicio,
                fecha_fin,
                activo
            });

            loggerAuditoria.info(`Periodo académico creado exitosamente: ${nombre}.`);

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Periodo académico creado con éxito.",
                periodo: periodoCreado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en crearPeriodo: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al crear el periodo académico."
            });
        }
    }

    /**
     * Objetivo: Obtener la lista completa de periodos académicos.
     * Parámetros:
     *   - peticion: {Object} Petición Express.
     *   - respuesta: {Object} Respuesta Express.
     */
    async listarPeriodos(peticion, respuesta) {
        try {
            const periodos = await this.servicioPeriodo.listarTodos();
            return respuesta.status(200).json({
                exitoso: true,
                periodos
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarPeriodos: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar los periodos académicos."
            });
        }
    }

    /**
     * Objetivo: Buscar un periodo académico por su ID único.
     * Parámetros:
     *   - peticion: {Object} Petición Express.
     *   - respuesta: {Object} Respuesta Express.
     */
    async buscarPeriodoPorId(peticion, respuesta) {
        const idPeriodo = parseInt(peticion.params.id);

        try {
            const periodo = await this.servicioPeriodo.buscarPorId(idPeriodo);
            if (!periodo) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Periodo académico no encontrado."
                });
            }

            return respuesta.status(200).json({
                exitoso: true,
                periodo
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en buscarPeriodoPorId: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al buscar el periodo académico."
            });
        }
    }

    /**
     * Objetivo: Actualizar un periodo académico.
     * Parámetros:
     *   - peticion: {Object} Petición Express.
     *   - respuesta: {Object} Respuesta Express.
     */
    async actualizarPeriodo(peticion, respuesta) {
        const idPeriodo = parseInt(peticion.params.id);
        const { nombre, fecha_inicio, fecha_fin, activo } = peticion.body;

        try {
            const periodoExistente = await this.servicioPeriodo.buscarPorId(idPeriodo);
            if (!periodoExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Periodo académico no encontrado."
                });
            }

            // Validar coherencia de fechas si se envían ambas o parcialmente
            const nuevaFechaInicio = fecha_inicio ? new Date(fecha_inicio) : periodoExistente.fecha_inicio;
            const nuevaFechaFin = fecha_fin ? new Date(fecha_fin) : periodoExistente.fecha_fin;

            if (nuevaFechaInicio >= nuevaFechaFin) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: La fecha de inicio debe ser estrictamente anterior a la fecha de fin."
                });
            }

            // Validar duplicidad de nombre
            if (nombre && nombre.trim() !== periodoExistente.nombre) {
                const periodoDuplicado = await this.servicioPeriodo.buscarPorNombre(nombre);
                if (periodoDuplicado) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: `El nombre de periodo académico '${nombre}' ya se encuentra ocupado.`
                    });
                }
            }

            const periodoActualizado = await this.servicioPeriodo.actualizarPeriodo(idPeriodo, {
                nombre,
                fecha_inicio,
                fecha_fin,
                activo
            });

            loggerAuditoria.info(`Periodo académico ID ${idPeriodo} actualizado exitosamente.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Periodo académico actualizado con éxito.",
                periodo: periodoActualizado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en actualizarPeriodo: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al actualizar el periodo académico."
            });
        }
    }

    /**
     * Objetivo: Eliminar un periodo académico (sólo si no tiene horarios asociados).
     * Parámetros:
     *   - peticion: {Object} Petición Express.
     *   - respuesta: {Object} Respuesta Express.
     */
    async eliminarPeriodo(peticion, respuesta) {
        const idPeriodo = parseInt(peticion.params.id);

        try {
            const periodoExistente = await this.servicioPeriodo.buscarPorId(idPeriodo);
            if (!periodoExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Periodo académico no encontrado."
                });
            }

            // RN-Periodo-03: Validar que no existan horarios asignados
            const tieneHorarios = await this.servicioPeriodo.tieneHorariosVinculados(idPeriodo);
            if (tieneHorarios) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "Restricción de integridad: No se puede eliminar el periodo académico porque cuenta con horarios asignados."
                });
            }

            await this.servicioPeriodo.eliminarPeriodo(idPeriodo);

            loggerAuditoria.info(`Periodo académico ID ${idPeriodo} eliminado con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Periodo académico eliminado con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarPeriodo: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar el periodo académico."
            });
        }
    }
}

module.exports = ControladorPeriodo;
