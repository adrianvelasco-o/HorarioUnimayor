/**
 * Caso de uso implementado: UC-24 al UC-29 (Gestión de Horarios)
 * Requisitos funcionales relacionados: RF7, RF13
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Horarios / API REST
 * Patrones de diseño utilizados: Singleton (Controlador único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de horarios)
 */

const loggerAuditoria = require("../../configuracion/logger");
const FachadaHorario = require("./fachadaHorario").obtenerInstancia();
const ServicioHorario = require("./servicioHorario");

class ControladorHorario {
    /**
     * @private
     * @type {ControladorHorario}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorHorario.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioHorario = new ServicioHorario();
        ControladorHorario.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única de control.
     */
    static obtenerInstancia() {
        if (!ControladorHorario.#instanciaUnica) {
            new ControladorHorario();
        }
        return ControladorHorario.#instanciaUnica;
    }

    /**
     * Objetivo: Crear un horario a través de la Fachada.
     */
    async crearHorario(peticion, respuesta) {
        try {
            const horarioCreado = await FachadaHorario.programarHorario(peticion.body);
            loggerAuditoria.info(`Horario ID ${horarioCreado.id_horario} programado con éxito.`);
            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Horario programado con éxito.",
                horario: horarioCreado
            });
        } catch (errorNegocio) {
            loggerAuditoria.warn(`Intento fallido de programación de horario: ${errorNegocio.message}`);
            return respuesta.status(400).json({
                exitoso: false,
                mensaje: errorNegocio.message
            });
        }
    }

    /**
     * Objetivo: Listar todos los horarios en un periodo académico.
     */
    async listarHorarios(peticion, respuesta) {
        const idPeriodo = parseInt(peticion.query.id_periodo);

        if (!idPeriodo) {
            return respuesta.status(400).json({
                exitoso: false,
                mensaje: "El parámetro query 'id_periodo' es obligatorio."
            });
        }

        try {
            const horarios = await this.servicioHorario.listarPorPeriodo(idPeriodo);
            return respuesta.status(200).json({
                exitoso: true,
                horarios
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarHorarios: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar horarios."
            });
        }
    }

    /**
     * Objetivo: Eliminar un horario programado.
     */
    async eliminarHorario(peticion, respuesta) {
        const idHorario = parseInt(peticion.params.id);

        try {
            const horarioExistente = await this.servicioHorario.buscarPorId(idHorario);
            if (!horarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El horario no existe."
                });
            }

            await this.servicioHorario.eliminarHorario(idHorario);
            loggerAuditoria.info(`Horario ID ${idHorario} eliminado con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Horario eliminado con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarHorario: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar horario."
            });
        }
    }
}

module.exports = ControladorHorario;
