/**
 * Propósito: Mapeo de endpoints REST con sus respectivos middlewares de validación de JWT y RBAC.
 * Caso de uso: UC-Security (Seguridad y Control de Acceso)
 * Requisitos relacionados: RF-Seguridad-01 al RF-Seguridad-05
 * Patrones de diseño: Enrutador Express
 * Principios SOLID: SRP
 * Fecha: 2026-07-12
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const controladorSeguridad = require("./controladorSeguridad").obtenerInstancia();
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");

const rutasSeguridad = express.Router();

// Middleware helper de validación de campos
const validarPeticion = (peticion, respuesta, siguiente) => {
    const errores = validationResult(peticion);
    if (!errores.isEmpty()) {
        return respuesta.status(400).json({
            exitoso: false,
            errores: errores.array().map(err => ({ campo: err.path, mensaje: err.msg }))
        });
    }
    siguiente();
};

// ==========================================
// ENDPOINTS DE USUARIOS
// ==========================================

rutasSeguridad.get(
    "/usuarios",
    verificarTokenAcceso,
    autorizar("USUARIOS_VER"),
    (req, res) => controladorSeguridad.listarUsuarios(req, res)
);

rutasSeguridad.put(
    "/usuarios/:id",
    verificarTokenAcceso,
    autorizar("USUARIOS_EDITAR"),
    [
        body("nombres").notEmpty().withMessage("El nombre es requerido."),
        body("apellidos").notEmpty().withMessage("El apellido es requerido."),
        body("id_rol").isInt().withMessage("El id_rol debe ser un número entero.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.actualizarUsuario(req, res)
);

rutasSeguridad.put(
    "/usuarios/:id/activo",
    verificarTokenAcceso,
    autorizar("USUARIOS_ACTIVAR"),
    [
        body("activo").isBoolean().withMessage("El estado activo debe ser booleano.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.cambiarEstadoUsuario(req, res)
);

rutasSeguridad.put(
    "/usuarios/:id/contrasena",
    verificarTokenAcceso,
    autorizar("USUARIOS_EDITAR"), // Se requiere permiso de edición de usuarios para restablecer contraseñas
    [
        body("contrasena").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.cambiarContrasenaUsuario(req, res)
);

rutasSeguridad.delete(
    "/usuarios/:id",
    verificarTokenAcceso,
    autorizar("USUARIOS_ELIMINAR"),
    (req, res) => controladorSeguridad.eliminarUsuario(req, res)
);

rutasSeguridad.get(
    "/usuarios/:id/historial",
    verificarTokenAcceso,
    autorizar("USUARIOS_HISTORIAL"),
    (req, res) => controladorSeguridad.obtenerHistorialUsuario(req, res)
);

// ==========================================
// ENDPOINTS DE ROLES
// ==========================================

rutasSeguridad.get(
    "/roles",
    verificarTokenAcceso,
    autorizar("ROLES_VER"),
    (req, res) => controladorSeguridad.listarRoles(req, res)
);

rutasSeguridad.post(
    "/roles",
    verificarTokenAcceso,
    autorizar("ROLES_CREAR"),
    [
        body("nombre").notEmpty().withMessage("El nombre del rol es obligatorio.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.crearRol(req, res)
);

rutasSeguridad.put(
    "/roles/:id",
    verificarTokenAcceso,
    autorizar("ROLES_EDITAR"),
    [
        body("nombre").notEmpty().withMessage("El nombre del rol es obligatorio.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.actualizarRol(req, res)
);

rutasSeguridad.put(
    "/roles/:id/activo",
    verificarTokenAcceso,
    autorizar("ROLES_EDITAR"),
    [
        body("activo").isBoolean().withMessage("El estado activo debe ser booleano.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.cambiarEstadoRol(req, res)
);

rutasSeguridad.delete(
    "/roles/:id",
    verificarTokenAcceso,
    autorizar("ROLES_ELIMINAR"),
    (req, res) => controladorSeguridad.eliminarRol(req, res)
);

// ==========================================
// ENDPOINTS DE PERMISOS
// ==========================================

rutasSeguridad.get(
    "/permisos",
    verificarTokenAcceso,
    autorizar("PERMISOS_VER"),
    (req, res) => controladorSeguridad.listarPermisos(req, res)
);

rutasSeguridad.get(
    "/roles/:id/permisos",
    verificarTokenAcceso,
    autorizar("PERMISOS_VER"),
    (req, res) => controladorSeguridad.obtenerPermisosRol(req, res)
);

rutasSeguridad.post(
    "/roles/:id/permisos",
    verificarTokenAcceso,
    autorizar("PERMISOS_ASIGNAR"),
    [
        body("permisos").isArray().withMessage("Debe proveer una lista de IDs de permisos.")
    ],
    validarPeticion,
    (req, res) => controladorSeguridad.guardarPermisosRol(req, res)
);

// ==========================================
// ENDPOINT DE AUDITORÍA GLOBAL
// ==========================================

rutasSeguridad.get(
    "/auditoria",
    verificarTokenAcceso,
    autorizar("AUDITORIA_VER"),
    (req, res) => controladorSeguridad.listarAuditoria(req, res)
);

module.exports = rutasSeguridad;
