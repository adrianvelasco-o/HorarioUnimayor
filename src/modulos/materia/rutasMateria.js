/**
 * Caso de uso implementado: UC-30 al UC-34 (Gestión de Materias)
 * Requisitos funcionales relacionados: RF8, RF14, RF19, RF24, RF29
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de materias)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorMateria = require("./controladorMateria").obtenerInstancia();

const rutasMateria = express.Router();

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
rutasMateria.post(
    "/",
    verificarTokenAcceso,
    autorizar("MATERIAS_CREAR"),
    [
        body("codigo").notEmpty().withMessage("El código de la materia es obligatorio."),
        body("nombre").notEmpty().withMessage("El nombre de la materia es obligatorio."),
        body("creditos").isInt({ min: 1 }).withMessage("Los créditos deben ser un entero positivo."),
        body("horas_semanales").isInt({ min: 1 }).withMessage("Las horas semanales deben ser un entero positivo.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorMateria.crearMateria(peticion, respuesta)
);

rutasMateria.get(
    "/",
    verificarTokenAcceso,
    autorizar("MATERIAS_VER"),
    (peticion, respuesta) => controladorMateria.listarMaterias(peticion, respuesta)
);

rutasMateria.get(
    "/:id",
    verificarTokenAcceso,
    autorizar("MATERIAS_VER"),
    (peticion, respuesta) => controladorMateria.buscarMateriaPorId(peticion, respuesta)
);

rutasMateria.put(
    "/:id",
    verificarTokenAcceso,
    autorizar("MATERIAS_EDITAR"),
    [
        body("codigo").optional().notEmpty().withMessage("El código no puede estar vacío."),
        body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío."),
        body("creditos").optional().isInt({ min: 1 }).withMessage("Los créditos deben ser positivos."),
        body("horas_semanales").optional().isInt({ min: 1 }).withMessage("Las horas deben ser positivas.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorMateria.actualizarMateria(peticion, respuesta)
);

rutasMateria.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("MATERIAS_ELIMINAR"),
    (peticion, respuesta) => controladorMateria.eliminarMateria(peticion, respuesta)
);

module.exports = rutasMateria;
