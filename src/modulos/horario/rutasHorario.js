/**
 * Caso de uso implementado: UC-24 al UC-29 (Gestión de Horarios)
 * Requisitos funcionales relacionados: RF7, RF13
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de horarios)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorHorario = require("./controladorHorario").obtenerInstancia();

const rutasHorario = express.Router();

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

// Rutas protegidas (El docente tiene permisos GET para leer horarios: UC-29, pero no POST/DELETE)
rutasHorario.post(
    "/",
    verificarTokenAcceso,
    autorizar("HORARIOS_CREAR"),
    [
        body("id_periodo").isInt().withMessage("El periodo debe ser un número entero."),
        body("id_docente").isInt().withMessage("El docente debe ser un número entero."),
        body("id_salon").isInt().withMessage("El salón debe ser un número entero."),
        body("dia_semana").isIn(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]).withMessage("Día de la semana no válido."),
        body("hora_inicio").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Hora de inicio debe ser formato HH:MM."),
        body("hora_fin").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Hora de fin debe ser formato HH:MM.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorHorario.crearHorario(peticion, respuesta)
);

rutasHorario.get(
    "/",
    verificarTokenAcceso,
    autorizar("HORARIOS_VER"),
    (peticion, respuesta) => controladorHorario.listarHorarios(peticion, respuesta)
);

rutasHorario.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("HORARIOS_ELIMINAR"),
    (peticion, respuesta) => controladorHorario.eliminarHorario(peticion, respuesta)
);

module.exports = rutasHorario;
