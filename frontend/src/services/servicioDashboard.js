import servicioPeriodo from "./servicioPeriodo";
import servicioDocente from "./servicioDocente";
import servicioSalon from "./servicioSalon";
import servicioMateria from "./servicioMateria";
import servicioHorario from "./servicioHorario";

/**
 * Propósito: Servicio que consolida la información estadística para el Dashboard
 * Caso de uso: UC-24 al UC-34 (Soporte Visual de Indicadores del Dashboard)
 * Requisitos relacionados: RF7, RF8, RF1
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia del estado del sistema)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
const servicioDashboard = {
  /**
   * Objetivo: Obtener la cantidad de registros e información resumida de cada entidad.
   */
  async obtenerMetricasConsolidadas() {
    try {
      const periodos = await servicioPeriodo.obtenerTodos();
      const docentes = await servicioDocente.obtenerTodos();
      const salones = await servicioSalon.obtenerTodos();
      const materias = await servicioMateria.obtenerTodos();

      // Buscar periodo activo para contar horarios del ciclo actual
      const periodoActivo = periodos.find((p) => p.activo === true) || periodos[0];
      let horarios = [];
      if (periodoActivo) {
        horarios = await servicioHorario.obtenerPorPeriodo(periodoActivo.id_periodo);
      }

      return {
        conteoPeriodos: periodos.length,
        conteoDocentes: docentes.length,
        conteoSalones: salones.length,
        conteoMaterias: materias.length,
        conteoHorarios: horarios.length,
        nombrePeriodoActivo: periodoActivo ? periodoActivo.nombre : "Ninguno",
      };
    } catch (errorConsolidacion) {
      console.error("Error al consolidar métricas del dashboard:", errorConsolidacion);
      throw errorConsolidacion;
    }
  },
};

export default servicioDashboard;
