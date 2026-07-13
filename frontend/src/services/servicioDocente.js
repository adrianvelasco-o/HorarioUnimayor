import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Docentes (CRUD)
 * Caso de uso: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia transaccional)
 * Fecha: 2026-07-11
 */
const servicioDocente = {
  async obtenerTodos() {
    const respuesta = await clienteApi.get("/docentes");
    return respuesta.data.docentes || [];
  },

  async crear(datosDocente) {
    const respuesta = await clienteApi.post("/docentes", datosDocente);
    return respuesta.data;
  },

  async eliminar(idDocente) {
    const respuesta = await clienteApi.delete(`/docentes/${idDocente}`);
    return respuesta.data;
  },
};

export default servicioDocente;
