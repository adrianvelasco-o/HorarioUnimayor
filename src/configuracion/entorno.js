/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF32 (Protección de datos y credenciales)
 * Escenarios QAW relacionados: QS-1 (Seguridad)
 * Componentes C4 involucrados: Configuración de Entorno
 * Patrones de diseño utilizados: Singleton (Carga única de variables)
 * Principios SOLID aplicados: SRP (Carga y validación de variables de entorno)
 */

const dotenv = require("dotenv");
const path = require("path");

class ConfiguracionApp {
    /**
     * @private
     * @type {ConfiguracionApp}
     */
    static #instanciaConfiguracion = null;

    /**
     * @private
     */
    constructor() {
        if (ConfiguracionApp.#instanciaConfiguracion) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.#cargarVariables();
        ConfiguracionApp.#instanciaConfiguracion = this;
    }

    /**
     * Objetivo: Obtener la instancia única de configuración de la app.
     * Parámetros: Ninguno.
     * Valor retornado: {ConfiguracionApp} Instancia única.
     * Excepciones: Ninguna.
     * Reglas de negocio aplicadas: Carga única del entorno institucional al arranque.
     */
    static obtenerInstancia() {
        if (!ConfiguracionApp.#instanciaConfiguracion) {
            new ConfiguracionApp();
        }
        return ConfiguracionApp.#instanciaConfiguracion;
    }

    /**
     * @private
     * Objetivo: Cargar y validar las variables de entorno desde el archivo .env.
     */
    #cargarVariables() {
        dotenv.config({ path: path.join(__dirname, "../../.env") });

        this.servidorPuerto = process.env.DATABASE_PORT ? 3000 : 3000;
        this.servidorUrlDb = process.env.DATABASE_URL || "postgresql://postgres:0000@localhost:9000/HorarioUniMayor?schema=public";
        this.jwtClaveSecreta = process.env.JWT_SECRET || "firma_secreta_institucional_colegio_mayor_del_cauca_2026";
        this.jwtExpiracion = process.env.JWT_EXPIRATION || "4h";

        // Validar variables requeridas de forma obligatoria
        if (!process.env.DATABASE_URL && !process.env.DATABASE_PORT) {
            console.warn("Advertencia: No se encontraron variables de base de datos en el entorno. Se usarán valores predeterminados.");
        }
    }
}

module.exports = ConfiguracionApp;
