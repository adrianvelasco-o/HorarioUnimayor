/**
 * Caso de uso implementado: UC-9, UC-10, UC-11, UC-12, UC-13 (Gestión de Periodos Académicos)
 * Requisitos funcionales relacionados: RF3, RF11, RF15, RF20, RF25
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad)
 * Componentes C4 involucrados: Enrutador Express / API REST
 * Patrones de diseño utilizados: Enrutador del Framework Express
 * Principios SOLID aplicados: SRP (Responsabilidad única de mapear rutas de periodos)
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { verificarTokenAcceso, autorizar } = require("../../middlewares/autenticacion");
const controladorPeriodo = require("./controladorPeriodo").obtenerInstancia();

const rutasPeriodo = express.Router();

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

// Rutas protegidas (Requieren autenticación JWT y permisos granulares)
rutasPeriodo.post(
    "/",
    verificarTokenAcceso,
    autorizar("PERIODOS_CREAR"),
    [
        body("nombre").notEmpty().withMessage("El nombre del periodo es obligatorio."),
        body("fecha_inicio").isISO8601().withMessage("Debe suministrar una fecha de inicio válida (ISO8601)."),
        body("fecha_fin").isISO8601().withMessage("Debe suministrar una fecha de fin válida (ISO8601).")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorPeriodo.crearPeriodo(peticion, respuesta)
);

rutasPeriodo.get(
    "/",
    verificarTokenAcceso,
    autorizar("PERIODOS_VER"),
    (peticion, respuesta) => controladorPeriodo.listarPeriodos(peticion, respuesta)
);

rutasPeriodo.get(
    "/:id",
    verificarTokenAcceso,
    autorizar("PERIODOS_VER"),
    (peticion, respuesta) => controladorPeriodo.buscarPeriodoPorId(peticion, respuesta)
);

rutasPeriodo.put(
    "/:id",
    verificarTokenAcceso,
    autorizar("PERIODOS_EDITAR"),
    [
        body("nombre").optional().notEmpty().withMessage("El nombre del periodo no puede estar vacío."),
        body("fecha_inicio").optional().isISO8601().withMessage("La fecha de inicio debe ser válida."),
        body("fecha_fin").optional().isISO8601().withMessage("La fecha de fin debe ser válida.")
    ],
    validarPeticion,
    (peticion, respuesta) => controladorPeriodo.actualizarPeriodo(peticion, respuesta)
);

rutasPeriodo.delete(
    "/:id",
    verificarTokenAcceso,
    autorizar("PERIODOS_ELIMINAR"),
    (peticion, respuesta) => controladorPeriodo.eliminarPeriodo(peticion, respuesta)
);

module.exports = rutasPeriodo;
