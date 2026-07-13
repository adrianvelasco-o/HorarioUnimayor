/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2
 * Escenarios QAW relacionados: QS-2 (Disponibilidad)
 * Componentes C4 involucrados: Contenedor API Backend / Servidor HTTP
 * Patrones de diseño utilizados: Singleton (Configuración, Logger, Base de Datos)
 * Principios SOLID aplicados: SRP (Responsabilidad única de inicialización del servidor Express)
 */

const express = require("express");
const configuracionApp = require("./entorno").obtenerInstancia();
const loggerAuditoria = require("./logger");
const rutasAutenticacion = require("../modulos/autenticacion/rutasAutenticacion");
const rutasPeriodo = require("../modulos/periodo/rutasPeriodo");
const rutasDocente = require("../modulos/docente/rutasDocente");
const rutasSalon = require("../modulos/salon/rutasSalon");
const rutasLabor = require("../modulos/labor/rutasLabor");
const rutasMateria = require("../modulos/materia/rutasMateria");
const rutasHorario = require("../modulos/horario/rutasHorario");
const rutasSeguridad = require("../modulos/seguridad/rutasSeguridad");

const aplicacionExpress = express();

// Middlewares globales de parsing
aplicacionExpress.use(express.json());
aplicacionExpress.use(express.urlencoded({ extended: true }));

// Middleware de CORS para permitir peticiones del cliente (Next.js)
aplicacionExpress.use((peticion, respuesta, siguiente) => {
    respuesta.setHeader("Access-Control-Allow-Origin", "*");
    respuesta.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    respuesta.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (peticion.method === "OPTIONS") {
        return respuesta.sendStatus(200);
    }
    siguiente();
});

// Logs de peticiones entrantes
aplicacionExpress.use((peticion, respuesta, siguiente) => {
    loggerAuditoria.info(`Petición HTTP recibida: ${peticion.method} ${peticion.url}`);
    siguiente();
});

// Registrar rutas de los diferentes módulos del sistema
aplicacionExpress.use("/api/autenticacion", rutasAutenticacion);
aplicacionExpress.use("/api/periodos", rutasPeriodo);
aplicacionExpress.use("/api/docentes", rutasDocente);
aplicacionExpress.use("/api/salones", rutasSalon);
aplicacionExpress.use("/api/labores", rutasLabor);
aplicacionExpress.use("/api/materias", rutasMateria);
aplicacionExpress.use("/api/horarios", rutasHorario);
aplicacionExpress.use("/api/seguridad", rutasSeguridad);

// Manejador global de excepciones (QS-2 Disponibilidad)
aplicacionExpress.use((errorExcepcion, peticion, respuesta, siguiente) => {
    loggerAuditoria.error(`Excepción no controlada en el servidor: ${errorExcepcion.stack || errorExcepcion.message}`);
    return respuesta.status(500).json({
        exitoso: false,
        mensaje: "Ocurrió un error inesperado en el servidor."
    });
});

const puertoEscucha = process.env.PORT || configuracionApp.servidorPuerto;

// Solo iniciamos el servidor si no estamos corriendo en entorno de pruebas (Jest)
if (process.env.NODE_ENV !== "test") {
    aplicacionExpress.listen(puertoEscucha, () => {
        loggerAuditoria.info(`Servidor de HorarioUniMayor backend iniciado en http://localhost:${puertoEscucha}`);
    });
}

module.exports = aplicacionExpress;
