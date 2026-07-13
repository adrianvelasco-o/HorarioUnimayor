/**
 * Caso de uso implementado: UC-30 al UC-34 (Gestión de Materias)
 * Requisitos funcionales relacionados: RF8, RF14, RF19, RF24, RF29
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Materia
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de materias)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioMateria {
    /**
     * Objetivo: Buscar materia por código.
     */
    async buscarPorCodigo(codigoMateria) {
        return await clientePrisma.materia.findUnique({
            where: {
                codigo: codigoMateria.trim().toUpperCase()
            }
        });
    }

    /**
     * Objetivo: Buscar materia por nombre.
     */
    async buscarPorNombre(nombreMateria) {
        return await clientePrisma.materia.findUnique({
            where: {
                nombre: nombreMateria.trim()
            }
        });
    }

    /**
     * Objetivo: Buscar materia por ID.
     */
    async buscarPorId(idMateria) {
        return await clientePrisma.materia.findUnique({
            where: {
                id_materia: idMateria
            }
        });
    }

    /**
     * Objetivo: Listar todas las materias.
     */
    async listarTodas() {
        return await clientePrisma.materia.findMany({
            orderBy: {
                nombre: "asc"
            }
        });
    }

    /**
     * Objetivo: Crear una materia.
     */
    async crearMateria(datosMateria) {
        return await clientePrisma.materia.create({
            data: {
                codigo: datosMateria.codigo.trim().toUpperCase(),
                nombre: datosMateria.nombre.trim(),
                creditos: datosMateria.creditos,
                horas_semanales: datosMateria.horas_semanales
            }
        });
    }

    /**
     * Objetivo: Actualizar una materia existente.
     */
    async actualizarMateria(idMateria, datosActualizar) {
        return await clientePrisma.materia.update({
            where: {
                id_materia: idMateria
            },
            data: {
                codigo: datosActualizar.codigo ? datosActualizar.codigo.trim().toUpperCase() : undefined,
                nombre: datosActualizar.nombre ? datosActualizar.nombre.trim() : undefined,
                creditos: datosActualizar.creditos,
                horas_semanales: datosActualizar.horas_semanales
            }
        });
    }

    /**
     * Objetivo: Verificar si la materia tiene horarios vinculados.
     */
    async tieneHorariosAsociados(idMateria) {
        const contadorHorarios = await clientePrisma.horario.count({
            where: {
                id_materia: idMateria
            }
        });
        return contadorHorarios > 0;
    }

    /**
     * Objetivo: Eliminar físicamente una materia de base de datos.
     */
    async eliminarMateria(idMateria) {
        return await clientePrisma.materia.delete({
            where: {
                id_materia: idMateria
            }
        });
    }
}

module.exports = ServicioMateria;
