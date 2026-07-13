import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de consumo API para el Módulo de Horarios (Núcleo de Programación)
 * Caso de uso: UC-24 al UC-29 (Gestión y Visualización de Horarios)
 * Requisitos relacionados: RF7, RF13, CAL-03, CAL-12
 * Escenarios QAW: QS-1 (Seguridad), QS-4 (Confiabilidad y consistencia relacional)
 * Fecha: 2026-07-11
 */
const servicioHorario = {
  async obtenerPorPeriodo(idPeriodo) {
    const respuesta = await clienteApi.get(`/horarios?id_periodo=${idPeriodo}`);
    return respuesta.data.horarios || [];
  },

  async crear(datosHorario) {
    const respuesta = await clienteApi.post("/horarios", datosHorario);
    return respuesta.data;
  },

  async eliminar(idHorario) {
    const respuesta = await clienteApi.delete(`/horarios/${idHorario}`);
    return respuesta.data;
  },
};

export default servicioHorario;
