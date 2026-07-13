/**
 * Caso de uso implementado: UC-14 al UC-18 (Gestión de Ambientes/Salones)
 * Requisitos funcionales relacionados: RF4, RF9, RF17, RF21, RF26
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Controlador de Salones / API REST
 * Patrones de diseño utilizados: Singleton (Controlador único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de salones)
 */

const loggerAuditoria = require("../../configuracion/logger");
const ServicioSalon = require("./servicioSalon");

class ControladorSalon {
    /**
     * @private
     * @type {ControladorSalon}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorSalon.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioSalon = new ServicioSalon();
        ControladorSalon.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única.
     */
    static obtenerInstancia() {
        if (!ControladorSalon.#instanciaUnica) {
            new ControladorSalon();
        }
        return ControladorSalon.#instanciaUnica;
    }

    /**
     * Objetivo: Crear un salón con validaciones de negocio.
     * Reglas de negocio aplicadas: RN-Salon-01 (Nombre único), RN-Salon-02 (Capacidad positiva).
     */
    async crearSalon(peticion, respuesta) {
        const { nombre, tipo, capacidad, ubicacion } = peticion.body;

        try {
            // 1. RN-Salon-02: Validar capacidad positiva
            if (parseInt(capacidad) <= 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: La capacidad del salón debe ser un número entero estrictamente mayor que cero."
                });
            }

            // 2. RN-Salon-01: Validar duplicidad
            const salonDuplicado = await this.servicioSalon.buscarPorNombre(nombre);
            if (salonDuplicado) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: `El ambiente/salón '${nombre}' ya se encuentra registrado.`
                });
            }

            const salonCreado = await this.servicioSalon.crearSalon({
                nombre,
                tipo,
                capacidad: parseInt(capacidad),
                ubicacion
            });

            loggerAuditoria.info(`Salón creado con éxito: ${nombre}.`);

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Salón creado con éxito.",
                salon: salonCreado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en crearSalon: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al crear salón."
            });
        }
    }

    /**
     * Objetivo: Listar todos los salones.
     */
    async listarSalones(peticion, respuesta) {
        try {
            const salones = await this.servicioSalon.listarTodos();
            return respuesta.status(200).json({
                exitoso: true,
                salones
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en listarSalones: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al listar salones."
            });
        }
    }

    /**
     * Objetivo: Buscar salón por ID.
     */
    async buscarSalonPorId(peticion, respuesta) {
        const idSalon = parseInt(peticion.params.id);

        try {
            const salon = await this.servicioSalon.buscarPorId(idSalon);
            if (!salon) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Salón no encontrado."
                });
            }

            return respuesta.status(200).json({
                exitoso: true,
                salon
            });
        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en buscarSalonPorId: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al buscar salón."
            });
        }
    }

    /**
     * Objetivo: Actualizar salón.
     */
    async actualizarSalon(peticion, respuesta) {
        const idSalon = parseInt(peticion.params.id);
        const { nombre, tipo, capacidad, ubicacion } = peticion.body;

        try {
            const salonExistente = await this.servicioSalon.buscarPorId(idSalon);
            if (!salonExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Salón no encontrado."
                });
            }

            if (capacidad !== undefined && parseInt(capacidad) <= 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Regla de negocio: La capacidad del salón debe ser mayor a cero."
                });
            }

            if (nombre && nombre.trim() !== salonExistente.nombre) {
                const nombreDuplicado = await this.servicioSalon.buscarPorNombre(nombre);
                if (nombreDuplicado) {
                    return respuesta.status(409).json({
                        exitoso: false,
                        mensaje: "El nombre del salón ya se encuentra registrado en otro ambiente."
                    });
                }
            }

            const salonActualizado = await this.servicioSalon.actualizarSalon(idSalon, {
                nombre,
                tipo,
                capacidad: capacidad ? parseInt(capacidad) : undefined,
                ubicacion
            });

            loggerAuditoria.info(`Salón ID ${idSalon} actualizado con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Salón actualizado con éxito.",
                salon: salonActualizado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en actualizarSalon: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al actualizar salón."
            });
        }
    }

    /**
     * Objetivo: Eliminar salón.
     * Reglas de negocio aplicadas: RN-Salon-03 (No borrar si tiene horarios programados).
     */
    async eliminarSalon(peticion, respuesta) {
        const idSalon = parseInt(peticion.params.id);

        try {
            const salonExistente = await this.servicioSalon.buscarPorId(idSalon);
            if (!salonExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "Salón no encontrado."
                });
            }

            const tieneHorarios = await this.servicioSalon.tieneHorariosVinculados(idSalon);
            if (tieneHorarios) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "Restricción de integridad: No se puede eliminar el ambiente porque cuenta con horarios asignados."
                });
            }

            await this.servicioSalon.eliminarSalon(idSalon);

            loggerAuditoria.info(`Salón ID ${idSalon} eliminado con éxito.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Salón eliminado con éxito."
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en eliminarSalon: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno al eliminar salón."
            });
        }
    }
}

module.exports = ControladorSalon;
