/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2
 * Escenarios QAW relacionados: QS-1 (Seguridad)
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear las rutas REST)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const controladorAutenticacion = require("./controladorAutenticacion").obtenerInstancia();

const rutasAutenticacion = express.Router();

// Middleware de validación básico para express-validator
const validarPeticion = (peticion, respuesta, siguiente) => {
    const erroresValidacion = validationResult(peticion);
    if (!erroresValidacion.isEmpty()) {
        return respuesta.status(400).json({
            exitoso: false,
            errores: erroresValidacion.array().map(err => ({ campo: err.path, mensaje: err.msg }))
        });
    }
    siguiente();
};

/**
 * Endpoint: POST /api/autenticacion/login
 * Objetivo: Validar credenciales de inicio de sesión.
 */
rutasAutenticacion.post(
    "/login",
    [
        body("correo").isEmail().withMessage("Debe suministrar un correo electrónico válido."),
        body("contrasena").notEmpty().withMessage("La contraseña es un campo obligatorio.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorAutenticacion.iniciarSesion(peticion, respuesta)
);

/**
 * Endpoint: POST /api/autenticacion/registro
 * Objetivo: Crear un nuevo usuario en la plataforma.
 */
rutasAutenticacion.post(
    "/registro",
    [
        body("nombres").notEmpty().withMessage("El nombre es obligatorio."),
        body("apellidos").notEmpty().withMessage("El apellido es obligatorio."),
        body("correo").isEmail().withMessage("Debe suministrar un correo electrónico válido."),
        body("contrasena").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres."),
        body("id_rol").isInt().withMessage("El identificador del rol debe ser un número entero.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorAutenticacion.registrarUsuario(peticion, respuesta)
);

module.exports = rutasAutenticacion;
