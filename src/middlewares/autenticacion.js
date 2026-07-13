/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión)
 * Requisitos funcionales relacionados: RF1, RF32
 * Escenarios QAW relacionados: QS-1 (Seguridad - Control de Acceso)
 * Componentes C4 involucrados: Middleware de Seguridad / API REST
 * Patrones de diseño utilizados: Interceptor / Chain of Responsibility
 * Principios SOLID aplicados: SRP (Responsabilidad única de control de accesos)
 */

const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();
const loggerAuditoria = require("../configuracion/logger");

/**
 * Objetivo: Middleware para verificar la validez del Token JWT en las peticiones entrantes.
 * Parámetros:
 *   - peticion: {Object} Objeto de solicitud HTTP de Express.
 *   - respuesta: {Object} Objeto de respuesta HTTP de Express.
 *   - siguiente: {Function} Callback para continuar al siguiente middleware.
 * Valor retornado: {void}
 * Excepciones: Retorna HTTP 401 si el token no es válido o está ausente.
 * Reglas de negocio aplicadas: Valida que el token JWT haya sido firmado por la clave secreta institucional.
 */
const verificarTokenAcceso = (peticion, respuesta, siguiente) => {
    const cabeceraAutorizacion = peticion.headers["authorization"];

    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith("Bearer ")) {
        loggerAuditoria.warn("Intento de acceso rechazado: Token de autorización ausente o inválido.");
        return respuesta.status(401).json({
            exitoso: false,
            mensaje: "Acceso denegado: Token de autorización no suministrado."
        });
    }

    const tokenAcceso = cabeceraAutorizacion.split(" ")[1];

    try {
        const payloadDecodificado = jwt.verify(tokenAcceso, configuracionApp.jwtClaveSecreta);
        peticion.usuario = payloadDecodificado;
        siguiente();
    } catch (errorExcepcion) {
        loggerAuditoria.error(`Error de autenticación JWT: ${errorExcepcion.message}`);
        return respuesta.status(401).json({
            exitoso: false,
            mensaje: "Acceso denegado: Token de autorización vencido o alterado."
        });
    }
};

/**
 * Objetivo: Middleware para autorizar las solicitudes basado en los roles permitidos (RBAC).
 * Parámetros:
 *   - rolesPermitidos: {Array<String>} Lista de nombres de roles con acceso.
 * Valor retornado: {Function} Middleware de Express configurado.
 * Excepciones: Retorna HTTP 403 si el rol del usuario no está autorizado.
 * Reglas de negocio aplicadas: RN-Roles-02 (Docente solo lectura, Administrador CRUD).
 */
const verificarRolAutorizado = (rolesPermitidos) => {
    return (peticion, respuesta, siguiente) => {
        const usuarioSesion = peticion.usuario;

        if (!usuarioSesion || !usuarioSesion.rol) {
            return respuesta.status(401).json({
                exitoso: false,
                mensaje: "Error de autenticación: Sesión no válida o usuario inexistente."
            });
        }

        const tienePermiso = rolesPermitidos.includes(usuarioSesion.rol);

        if (!tienePermiso) {
            loggerAuditoria.warn(
                `Acceso denegado para usuario ID ${usuarioSesion.id_usuario} con rol ${usuarioSesion.rol} al recurso.`
            );
            return respuesta.status(403).json({
                exitoso: false,
                mensaje: "Acceso denegado: Su rol institucional no tiene permisos para esta acción."
            });
        }

        siguiente();
    };
};

/**
 * Objetivo: Middleware de autorización basado en permisos granulares (RBAC / ISO 25010).
 * Parámetros:
 *   - permisoRequerido: {String} Código único del permiso requerido (ej: 'HORARIOS_CREAR').
 * Valor retornado: {Function} Middleware de Express.
 */
const autorizar = (permisoRequerido) => {
    return (peticion, respuesta, siguiente) => {
        const usuarioSesion = peticion.usuario;

        if (!usuarioSesion) {
            return respuesta.status(401).json({
                exitoso: false,
                mensaje: "Acceso denegado: Token de autorización ausente o inválido."
            });
        }

        // Fallbacks de compatibilidad (para soporte de tokens de tests y legacy sin array de permisos)
        const esAdmin = usuarioSesion.rol === "ADMINISTRADOR" || usuarioSesion.rol === "Administrador";
        const esDocente = usuarioSesion.rol === "DOCENTE" || usuarioSesion.rol === "Docente";
        const esPermisoLectura = permisoRequerido.endsWith("_VER") || permisoRequerido.endsWith("_CONSULTAR");

        const tienePermiso = esAdmin ||
                             (esDocente && esPermisoLectura) ||
                             (usuarioSesion.permisos && usuarioSesion.permisos.includes(permisoRequerido));

        if (!tienePermiso) {
            loggerAuditoria.warn(
                `Acceso denegado: Usuario ID ${usuarioSesion.idUsuario || usuarioSesion.id_usuario} intentó acceder a recurso protegido por permiso '${permisoRequerido}'.`
            );
            return respuesta.status(403).json({
                exitoso: false,
                mensaje: `Acceso denegado: Su rol institucional no tiene permisos o no posee el permiso '${permisoRequerido}' necesario para esta acción.`
            });
        }

        siguiente();
    };
};

module.exports = {
    verificarTokenAcceso,
    verificarRolAutorizado,
    autorizar
};
