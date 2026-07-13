import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Periodos Académicos
 * Caso de uso: UC-9 al UC-13 (Gestión de Periodos)
 * Requisitos relacionados: RF1, RF2
 * Escenarios QAW: QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */
const servicioPeriodo = {
  async obtenerTodos() {
    const respuesta = await clienteApi.get("/periodos");
    return respuesta.data.periodos || [];
  },

  async crear(datosPeriodo) {
    const respuesta = await clienteApi.post("/periodos", datosPeriodo);
    return respuesta.data;
  },

  async eliminar(idPeriodo) {
    const respuesta = await clienteApi.delete(`/periodos/${idPeriodo}`);
    return respuesta.data;
  },
};

export default servicioPeriodo;
