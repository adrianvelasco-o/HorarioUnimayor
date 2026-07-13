/**
 * Caso de uso implementado: UC-14 al UC-18 (Gestión de Ambientes/Salones)
 * Requisitos funcionales relacionados: RF4, RF9, RF17, RF21, RF26
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Salón
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de salones)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioSalon {
    /**
     * Objetivo: Buscar un salón por su nombre único.
     * Parámetros:
     *   - nombreSalon: {String} Nombre del salón (ej. 'Aula 301').
     * Valor retornado: {Promise<Object|null>} Registro del salón o null.
     */
    async buscarPorNombre(nombreSalon) {
        return await clientePrisma.salon.findUnique({
            where: {
                nombre: nombreSalon.trim()
            }
        });
    }

    /**
     * Objetivo: Buscar un salón por su ID único.
     * Parámetros:
     *   - idSalon: {Number} ID.
     */
    async buscarPorId(idSalon) {
        return await clientePrisma.salon.findUnique({
            where: {
                id_salon: idSalon
            }
        });
    }

    /**
     * Objetivo: Listar todos los salones/ambientes.
     */
    async listarTodos() {
        return await clientePrisma.salon.findMany({
            orderBy: {
                nombre: "asc"
            }
        });
    }

    /**
     * Objetivo: Registrar un nuevo salón en base de datos.
     */
    async crearSalon(datosSalon) {
        return await clientePrisma.salon.create({
            data: {
                nombre: datosSalon.nombre.trim(),
                tipo: datosSalon.tipo.trim().toUpperCase(),
                capacidad: datosSalon.capacidad,
                ubicacion: datosSalon.ubicacion
            }
        });
    }

    /**
     * Objetivo: Actualizar salón existente.
     */
    async actualizarSalon(idSalon, datosActualizar) {
        return await clientePrisma.salon.update({
            where: {
                id_salon: idSalon
            },
            data: {
                nombre: datosActualizar.nombre ? datosActualizar.nombre.trim() : undefined,
                tipo: datosActualizar.tipo ? datosActualizar.tipo.trim().toUpperCase() : undefined,
                capacidad: datosActualizar.capacidad,
                ubicacion: datosActualizar.ubicacion
            }
        });
    }

    /**
     * Objetivo: Verificar si el salón tiene horarios asociados.
     */
    async tieneHorariosVinculados(idSalon) {
        const contadorHorarios = await clientePrisma.horario.count({
            where: {
                id_salon: idSalon
            }
        });
        return contadorHorarios > 0;
    }

    /**
     * Objetivo: Eliminar físicamente un salón en PostgreSQL.
     */
    async eliminarSalon(idSalon) {
        return await clientePrisma.salon.delete({
            where: {
                id_salon: idSalon
            }
        });
    }
}

module.exports = ServicioSalon;
