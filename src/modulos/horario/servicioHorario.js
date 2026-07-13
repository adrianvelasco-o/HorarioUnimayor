/**
 * Caso de uso implementado: UC-24 al UC-29 (Gestión de Horarios)
 * Requisitos funcionales relacionados: RF7, RF13, RF28
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Horario
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de horarios)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioHorario {
    /**
     * Objetivo: Buscar horarios del docente para un día específico.
     */
    async buscarHorariosDocentePorDia(idDocente, diaSemana) {
        return await clientePrisma.horario.findMany({
            where: {
                id_docente: idDocente,
                dia_semana: diaSemana
            }
        });
    }

    /**
     * Objetivo: Buscar horarios de un salón para un día específico.
     */
    async buscarHorariosSalonPorDia(idSalon, diaSemana) {
        return await clientePrisma.horario.findMany({
            where: {
                id_salon: idSalon,
                dia_semana: diaSemana
            }
        });
    }

    /**
     * Objetivo: Obtener la sumatoria de horas ya programadas para un docente en un periodo.
     */
    async obtenerHorasProgramadasDocente(idDocente, idPeriodo) {
        const horarios = await clientePrisma.horario.findMany({
            where: {
                id_docente: idDocente,
                id_periodo: idPeriodo
            },
            include: {
                materia: true,
                labor: true
            }
        });

        // Sumar horas en base a la materia o labor programada
        let totalHoras = 0;
        horarios.forEach(h => {
            if (h.materia) totalHoras += h.materia.horas_semanales;
            else if (h.labor) totalHoras += h.labor.horas_semanales;
        });

        return totalHoras;
    }

    /**
     * Objetivo: Persistir un nuevo horario en PostgreSQL.
     */
    async crearHorario(datosHorario) {
        return await clientePrisma.horario.create({
            data: {
                id_periodo: datosHorario.id_periodo,
                id_docente: datosHorario.id_docente,
                id_salon: datosHorario.id_salon,
                id_materia: datosHorario.id_materia || null,
                id_labor: datosHorario.id_labor || null,
                dia_semana: datosHorario.dia_semana.trim().toUpperCase(),
                hora_inicio: datosHorario.hora_inicio.trim(),
                hora_fin: datosHorario.hora_fin.trim()
            },
            include: {
                docente: { include: { usuario: true } },
                salon: true,
                materia: true,
                labor: true,
                periodo: true
            }
        });
    }

    /**
     * Objetivo: Listar todos los horarios en un periodo.
     */
    async listarPorPeriodo(idPeriodo) {
        return await clientePrisma.horario.findMany({
            where: { id_periodo: idPeriodo },
            include: {
                docente: { include: { usuario: true } },
                salon: true,
                materia: true,
                labor: true
            }
        });
    }

    /**
     * Objetivo: Buscar horario por ID.
     */
    async buscarPorId(idHorario) {
        return await clientePrisma.horario.findUnique({
            where: { id_horario: idHorario },
            include: {
                materia: true,
                labor: true,
                docente: true
            }
        });
    }

    /**
     * Objetivo: Eliminar físicamente un horario.
     */
    async eliminarHorario(idHorario) {
        return await clientePrisma.horario.delete({
            where: { id_horario: idHorario }
        });
    }
}

module.exports = ServicioHorario;
