import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Materias (CRUD)
 * Caso de uso: UC-30 al UC-34 (Gestión de Materias / Asignaturas)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */
const servicioMateria = {
  async obtenerTodos() {
    const respuesta = await clienteApi.get("/materias");
    return respuesta.data.materias || [];
  },

  async crear(datosMateria) {
    const respuesta = await clienteApi.post("/materias", datosMateria);
    return respuesta.data;
  },

  async eliminar(idMateria) {
    const respuesta = await clienteApi.delete(`/materias/${idMateria}`);
    return respuesta.data;
  },
};

export default servicioMateria;
