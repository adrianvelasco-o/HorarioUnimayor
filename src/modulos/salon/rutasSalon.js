/**
 * Caso de uso implementado: UC-14 al UC-18 (Gestión de Ambientes/Salones)
 * Requisitos funcionales relacionados: RF4, RF9, RF17, RF21, RF26
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de salones)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorSalon = require("./controladorSalon").obtenerInstancia();

const rutasSalon = express.Router();

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
rutasSalon.post(
    "/",
    verificarTokenAcceso,
    autorizar("SALONES_CREAR"),
    [
        body("nombre").notEmpty().withMessage("El nombre del salón es obligatorio."),
        body("tipo").isIn(["AULA", "LABORATORIO"]).withMessage("El tipo debe ser 'AULA' o 'LABORATORIO'."),
        body("capacidad").isInt({ min: 1 }).withMessage("La capacidad debe ser un entero positivo.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorSalon.crearSalon(peticion, respuesta)
);

rutasSalon.get(
    "/",
    verificarTokenAcceso,
    autorizar("SALONES_VER"),
    (peticion, respuesta) => controladorSalon.listarSalones(peticion, respuesta)
);

rutasSalon.get(
    "/:id",
    verificarTokenAcceso,
    autorizar("SALONES_VER"),
    (peticion, respuesta) => controladorSalon.buscarSalonPorId(peticion, respuesta)
);

rutasSalon.put(
    "/:id",
    verificarTokenAcceso,
    autorizar("SALONES_EDITAR"),
    [
        body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío."),
        body("tipo").optional().isIn(["AULA", "LABORATORIO"]).withMessage("El tipo debe ser 'AULA' o 'LABORATORIO'."),
        body("capacidad").optional().isInt({ min: 1 }).withMessage("La capacidad debe ser positiva.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorSalon.actualizarSalon(peticion, respuesta)
);

rutasSalon.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("SALONES_ELIMINAR"),
    (peticion, respuesta) => controladorSalon.eliminarSalon(peticion, respuesta)
);

module.exports = rutasSalon;
