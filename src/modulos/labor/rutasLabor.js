/**
 * Caso de uso implementado: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos funcionales relacionados: RF5, RF10, RF18, RF23, RF28
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de labores)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorLabor = require("./controladorLabor").obtenerInstancia();

const rutasLabor = express.Router();

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
rutasLabor.post(
    "/",
    verificarTokenAcceso,
    autorizar("LABORES_CREAR"),
    [
        body("nombre").notEmpty().withMessage("El nombre de la labor es obligatorio."),
        body("horas_semanales").isInt({ min: 1 }).withMessage("Las horas semanales deben ser un entero positivo.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorLabor.crearLabor(peticion, respuesta)
);

rutasLabor.get(
    "/",
    verificarTokenAcceso,
    autorizar("LABORES_VER"),
    (peticion, respuesta) => controladorLabor.listarLabores(peticion, respuesta)
);

rutasLabor.get(
    "/:id",
    verificarTokenAcceso,
    autorizar("LABORES_VER"),
    (peticion, respuesta) => controladorLabor.buscarLaborPorId(peticion, respuesta)
);

rutasLabor.put(
    "/:id",
    verificarTokenAcceso,
    autorizar("LABORES_EDITAR"),
    [
        body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío."),
        body("horas_semanales").optional().isInt({ min: 1 }).withMessage("Las horas deben ser positivas.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorLabor.actualizarLabor(peticion, respuesta)
);

rutasLabor.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("LABORES_ELIMINAR"),
    (peticion, respuesta) => controladorLabor.eliminarLabor(peticion, respuesta)
);

module.exports = rutasLabor;
