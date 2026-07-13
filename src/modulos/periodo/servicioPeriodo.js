/**
 * Caso de uso implementado: UC-9, UC-10, UC-11, UC-12, UC-13 (Gestión de Periodos Académicos)
 * Requisitos funcionales relacionados: RF3, RF11, RF15, RF20, RF25
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad), QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Periodo Académico
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de periodos)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioPeriodo {
    /**
     * Objetivo: Buscar un periodo académico por su nombre único.
     * Parámetros:
     *   - nombrePeriodo: {String} Nombre del periodo (ej. '2026-1').
     * Valor retornado: {Promise<Object|null>} Periodo académico encontrado o null.
     */
    async buscarPorNombre(nombrePeriodo) {
        return await clientePrisma.periodoAcademico.findUnique({
            where: {
                nombre: nombrePeriodo.trim()
            }
        });
    }

    /**
     * Objetivo: Buscar un periodo académico por su ID único.
     * Parámetros:
     *   - idPeriodo: {Number} ID de búsqueda.
     * Valor retornado: {Promise<Object|null>} Periodo académico encontrado o null.
     */
    async buscarPorId(idPeriodo) {
        return await clientePrisma.periodoAcademico.findUnique({
            where: {
                id_periodo: idPeriodo
            }
        });
    }

    /**
     * Objetivo: Obtener la lista completa de periodos académicos.
     * Parámetros: Ninguno.
     * Valor retornado: {Promise<Array<Object>>} Listado de periodos.
     */
    async listarTodos() {
        return await clientePrisma.periodoAcademico.findMany({
            orderBy: {
                fecha_inicio: "desc"
            }
        });
    }

    /**
     * Objetivo: Persistir un nuevo periodo académico en PostgreSQL.
     * Parámetros:
     *   - datosPeriodo: {Object} Datos del periodo (nombre, fecha_inicio, fecha_fin, activo).
     * Valor retornado: {Promise<Object>} Registro persistido en base de datos.
     */
    async crearPeriodo(datosPeriodo) {
        return await clientePrisma.periodoAcademico.create({
            data: {
                nombre: datosPeriodo.nombre.trim(),
                fecha_inicio: new Date(datosPeriodo.fecha_inicio),
                fecha_fin: new Date(datosPeriodo.fecha_fin),
                activo: datosPeriodo.activo ?? true
            }
        });
    }

    /**
     * Objetivo: Actualizar un periodo académico existente.
     * Parámetros:
     *   - idPeriodo: {Number} ID del periodo a actualizar.
     *   - datosActualizar: {Object} Nuevos datos.
     * Valor retornado: {Promise<Object>} Registro actualizado.
     */
    async actualizarPeriodo(idPeriodo, datosActualizar) {
        return await clientePrisma.periodoAcademico.update({
            where: {
                id_periodo: idPeriodo
            },
            data: {
                nombre: datosActualizar.nombre ? datosActualizar.nombre.trim() : undefined,
                fecha_inicio: datosActualizar.fecha_inicio ? new Date(datosActualizar.fecha_inicio) : undefined,
                fecha_fin: datosActualizar.fecha_fin ? new Date(datosActualizar.fecha_fin) : undefined,
                activo: datosActualizar.activo !== undefined ? datosActualizar.activo : undefined
            }
        });
    }

    /**
     * Objetivo: Verificar si existen horarios vinculados a un periodo académico.
     * Parámetros:
     *   - idPeriodo: {Number} ID del periodo.
     * Valor retornado: {Promise<Boolean>} True si existen horarios, False de lo contrario.
     */
    async tieneHorariosVinculados(idPeriodo) {
        const contadorHorarios = await clientePrisma.horario.count({
            where: {
                id_periodo: idPeriodo
            }
        });
        return contadorHorarios > 0;
    }

    /**
     * Objetivo: Eliminar un periodo académico físico en PostgreSQL.
     * Parámetros:
     *   - idPeriodo: {Number} ID del periodo a borrar.
     * Valor retornado: {Promise<Object>} Registro eliminado.
     */
    async eliminarPeriodo(idPeriodo) {
        return await clientePrisma.periodoAcademico.delete({
            where: {
                id_periodo: idPeriodo
            }
        });
    }
}

module.exports = ServicioPeriodo;
