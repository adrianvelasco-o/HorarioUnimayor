/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF32, CAL-02, CAL-34
 * Escenarios QAW relacionados: QS-1 (Seguridad - Auditoría de accesos)
 * Componentes C4 involucrados: Módulo de Auditoría / Logs Winston
 * Patrones de diseño utilizados: Singleton (Logger único)
 * Principios SOLID aplicados: SRP (Responsabilidad única de escritura de logs)
 */

const winston = require("winston");
const path = require("path");

class LoggerAuditoria {
    /**
     * @private
     * @type {winston.Logger}
     */
    static #instanciaLogger = null;

    /**
     * @private
     */
    constructor() {
        if (LoggerAuditoria.#instanciaLogger) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
    }

    /**
     * Objetivo: Obtener la instancia única de Winston Logger.
     * Parámetros: Ninguno.
     * Valor retornado: {winston.Logger} Instancia única de Winston.
     * Excepciones: Ninguna.
     * Reglas de negocio aplicadas: Auditoría inmutable de eventos de acceso en disco.
     */
    static obtenerLogger() {
        if (!LoggerAuditoria.#instanciaLogger) {
            const rutaLogs = path.join(__dirname, "../logs");

            LoggerAuditoria.#instanciaLogger = winston.createLogger({
                level: "info",
                format: winston.format.combine(
                    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        )
                    }),
                    new winston.transports.File({
                        filename: path.join(rutaLogs, "auditoria.log"),
                        level: "info"
                    }),
                    new winston.transports.File({
                        filename: path.join(rutaLogs, "errores.log"),
                        level: "error"
                    })
                ]
            });
        }
        return LoggerAuditoria.#instanciaLogger;
    }
}

// Exportamos directamente el objeto logger instanciado para simplificar el consumo
module.exports = LoggerAuditoria.obtenerLogger();
