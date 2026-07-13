import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Salones (CRUD)
 * Caso de uso: UC-14 al UC-18 (Gestión de Salones / Ambientes)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */
const servicioSalon = {
  async obtenerTodos() {
    const respuesta = await clienteApi.get("/salones");
    return respuesta.data.salones || [];
  },

  async crear(datosSalon) {
    const respuesta = await clienteApi.post("/salones", datosSalon);
    return respuesta.data;
  },

  async eliminar(idSalon) {
    const respuesta = await clienteApi.delete(`/salones/${idSalon}`);
    return respuesta.data;
  },
};

export default servicioSalon;
