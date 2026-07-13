import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Labores (CRUD)
 * Caso de uso: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */
const servicioLabor = {
  async obtenerTodos() {
    const respuesta = await clienteApi.get("/labores");
    return respuesta.data.labores || [];
  },

  async crear(datosLabor) {
    const respuesta = await clienteApi.post("/labores", datosLabor);
    return respuesta.data;
  },

  async eliminar(idLabor) {
    const respuesta = await clienteApi.delete(`/labores/${idLabor}`);
    return respuesta.data;
  },
};

export default servicioLabor;
