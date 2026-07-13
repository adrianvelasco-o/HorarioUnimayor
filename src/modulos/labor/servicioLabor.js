/**
 * Caso de uso implementado: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos funcionales relacionados: RF5, RF10, RF18, RF23, RF28
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Labor
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de labores)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioLabor {
    /**
     * Objetivo: Buscar una labor por su nombre único.
     * Parámetros:
     *   - nombreLabor: {String} Nombre de la labor (ej. 'Investigación').
     */
    async buscarPorNombre(nombreLabor) {
        return await clientePrisma.labor.findUnique({
            where: {
                nombre: nombreLabor.trim()
            }
        });
    }

    /**
     * Objetivo: Buscar labor por ID.
     */
    async buscarPorId(idLabor) {
        return await clientePrisma.labor.findUnique({
            where: {
                id_labor: idLabor
            }
        });
    }

    /**
     * Objetivo: Listar todas las labores académicas.
     */
    async listarTodas() {
        return await clientePrisma.labor.findMany({
            orderBy: {
                nombre: "asc"
            }
        });
    }

    /**
     * Objetivo: Crear una labor.
     */
    async crearLabor(datosLabor) {
        return await clientePrisma.labor.create({
            data: {
                nombre: datosLabor.nombre.trim(),
                descripcion: datosLabor.descripcion,
                horas_semanales: datosLabor.horas_semanales
            }
        });
    }

    /**
     * Objetivo: Actualizar una labor existente.
     */
    async actualizarLabor(idLabor, datosActualizar) {
        return await clientePrisma.labor.update({
            where: {
                id_labor: idLabor
            },
            data: {
                nombre: datosActualizar.nombre ? datosActualizar.nombre.trim() : undefined,
                descripcion: datosActualizar.descripcion,
                horas_semanales: datosActualizar.horas_semanales
            }
        });
    }

    /**
     * Objetivo: Verificar si la labor tiene horarios asociados.
     */
    async tieneHorariosAsociados(idLabor) {
        const contadorHorarios = await clientePrisma.horario.count({
            where: {
                id_labor: idLabor
            }
        });
        return contadorHorarios > 0;
    }

    /**
     * Objetivo: Eliminar físicamente una labor de base de datos.
     */
    async eliminarLabor(idLabor) {
        return await clientePrisma.labor.delete({
            where: {
                id_labor: idLabor
            }
        });
    }
}

module.exports = ServicioLabor;
