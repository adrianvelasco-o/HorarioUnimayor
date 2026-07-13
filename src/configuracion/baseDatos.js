/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2, RF32
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Base de Datos PostgreSQL / Prisma Client
 * Patrones de diseño utilizados: Singleton (Cliente Único de Prisma)
 * Principios SOLID aplicados: SRP (Responsabilidad única de conexión a base de datos)
 */

const { PrismaClient } = require("@prisma/client");
const loggerAuditoria = require("./logger");

class ClientePrisma {
    /**
     * @private
     * @type {PrismaClient}
     */
    static #instanciaCliente = null;

    /**
     * @private
     */
    constructor() {
        if (ClientePrisma.#instanciaCliente) {
            throw new Error("Error: No se puede instanciar directamente un Singleton. Use ClientePrisma.obtenerClientePrisma()");
        }
    }

    /**
     * Objetivo: Obtener la instancia única de Prisma Client.
     * Parámetros: Ninguno.
     * Valor retornado: {PrismaClient} Instancia única de conexión.
     * Excepciones: Ninguna.
     * Reglas de negocio aplicadas: Evita la duplicidad de conexiones a base de datos (CAL-11).
     */
    static obtenerClientePrisma() {
        if (!ClientePrisma.#instanciaCliente) {
            loggerAuditoria.info("Inicializando instancia única de Prisma Client...");
            ClientePrisma.#instanciaCliente = new PrismaClient({
                log: ["query", "info", "warn", "error"],
            });
        }
        return ClientePrisma.#instanciaCliente;
    }

    /**
     * Objetivo: Desconectar de forma segura el cliente de base de datos.
     * Parámetros: Ninguno.
     * Valor retornado: {Promise<void>} Promesa vacía de finalización.
     * Excepciones: {Error} Si la desconexión falla.
     * Reglas de negocio aplicadas: Liberación segura de recursos en apagado de infraestructura (QS-2).
     */
    static async desconectarBaseDatos() {
        if (ClientePrisma.#instanciaCliente) {
            await ClientePrisma.#instanciaCliente.$disconnect();
            ClientePrisma.#instanciaCliente = null;
            loggerAuditoria.info("Cliente de base de datos Prisma desconectado con éxito.");
        }
    }
}

module.exports = ClientePrisma;
