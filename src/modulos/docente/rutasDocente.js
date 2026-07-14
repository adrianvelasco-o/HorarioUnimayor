/**
 * Caso de uso implementado: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos funcionales relacionados: RF6, RF12, RF16, RF22, RF27
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de docentes)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorDocente = require("./controladorDocente").obtenerInstancia();

const rutasDocente = express.Router();

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

// Rutas protegidas
rutasDocente.post(
    "/",
    verificarTokenAcceso,
    autorizar("DOCENTES_CREAR"),
    [
        body("nombres").notEmpty().withMessage("El nombre es obligatorio."),
        body("apellidos").notEmpty().withMessage("El apellido es obligatorio."),
        body("correo").isEmail().withMessage("Debe suministrar un correo válido."),
        body("contrasena").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres."),
        body("id_rol").optional().isInt().withMessage("El rol debe ser un entero."),
        body("identificacion").notEmpty().withMessage("La identificación es obligatoria."),
        body("horas_semanales_maximas").isInt({ min: 1 }).withMessage("Las horas semanales deben ser un entero positivo."),
        body("tipo_contrato").notEmpty().withMessage("El tipo de contrato es obligatorio.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorDocente.crearDocente(peticion, respuesta)
);

rutasDocente.get(
    "/",
    verificarTokenAcceso,
    autorizar("DOCENTES_VER"),
    (peticion, respuesta) => controladorDocente.listarDocentes(peticion, respuesta)
);

rutasDocente.get(
    "/:id",
    verificarTokenAcceso,
    autorizar("DOCENTES_VER"),
    (peticion, respuesta) => controladorDocente.buscarDocentePorId(peticion, respuesta)
);

rutasDocente.put(
    "/:id",
    verificarTokenAcceso,
    autorizar("DOCENTES_EDITAR"),
    [
        body("nombres").optional().notEmpty().withMessage("El nombre no puede estar vacío."),
        body("apellidos").optional().notEmpty().withMessage("El apellido no puede estar vacío."),
        body("correo").optional().isEmail().withMessage("Debe ser un correo válido."),
        body("identificacion").optional().notEmpty().withMessage("La identificación no puede estar vacía."),
        body("horas_semanales_maximas").optional().isInt({ min: 1 }).withMessage("Las horas deben ser positivas.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorDocente.actualizarDocente(peticion, respuesta)
);

rutasDocente.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("DOCENTES_ELIMINAR"),
    (peticion, respuesta) => controladorDocente.eliminarDocente(peticion, respuesta)
);

module.exports = rutasDocente;
