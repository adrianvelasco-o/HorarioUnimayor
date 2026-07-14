/**
 * Caso de uso implementado: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos funcionales relacionados: RF6, RF12, RF16, RF22, RF27
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo Docente
 * Patrones de diseño utilizados: Repository (Servicio de Persistencia)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de docentes)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioDocente {
    /**
     * Objetivo: Buscar un docente por su ID único (cargando datos de usuario y docente).
     * Parámetros:
     *   - idDocente: {Number} ID del docente.
     * Valor retornado: {Promise<Object|null>} Registro del docente o null.
     */
    async buscarPorId(idDocente) {
        return await clientePrisma.docente.findUnique({
            where: {
                id_docente: idDocente
            },
            include: {
                usuario: {
                    include: {
                        rol: true
                    }
                }
            }
        });
    }

    /**
     * Objetivo: Buscar un docente por su identificación única institucional.
     * Parámetros:
     *   - identificacion: {String} Cédula o número identificador.
     */
    async buscarPorIdentificacion(identificacion) {
        return await clientePrisma.docente.findUnique({
            where: {
                identificacion: identificacion.trim()
            }
        });
    }

    /**
     * Objetivo: Buscar un rol por su nombre único.
     * Parámetros:
     *   - nombre: {String} Nombre del rol.
     */
    async obtenerRolPorNombre(nombre) {
        return await clientePrisma.rol.findUnique({
            where: {
                nombre: nombre
            }
        });
    }

    /**
     * Objetivo: Listar todos los docentes de la institución.
     */
    async listarTodos() {
        return await clientePrisma.docente.findMany({
            include: {
                usuario: true
            }
        });
    }

    /**
     * Objetivo: Crear un docente en la base de datos de forma atómica (Usuario + Perfil Docente).
     * Parámetros:
     *   - datosDocente: {Object} Datos combinados del usuario y el perfil de docente.
     */
    async crearDocente(datosDocente) {
        // Ejecutar transacción atómica para asegurar la consistencia (QS-4)
        return await clientePrisma.$transaction(async (transaccionPrisma) => {
            // Buscar si el usuario ya existe por correo
            let usuario = await transaccionPrisma.usuario.findUnique({
                where: { correo: datosDocente.correo.trim().toLowerCase() }
            });

            if (!usuario) {
                // Si no existe, crear el usuario
                usuario = await transaccionPrisma.usuario.create({
                    data: {
                        nombres: datosDocente.nombres,
                        apellidos: datosDocente.apellidos,
                        correo: datosDocente.correo,
                        contrasena: datosDocente.contrasena,
                        id_rol: datosDocente.id_rol
                    }
                });
            } else {
                // Si existe, verificar si ya tiene un perfil docente
                const docenteExistente = await transaccionPrisma.docente.findUnique({
                    where: { id_docente: usuario.id_usuario }
                });
                
                if (docenteExistente) {
                    // Lanzar un error específico de Prisma para que sea capturado como clave única duplicada en el controlador
                    const error = new Error("El correo electrónico ya se encuentra registrado.");
                    error.code = "P2002";
                    error.meta = { target: ["correo"] };
                    throw error;
                }

                // Si no tiene perfil de docente, actualizamos nombres, apellidos y rol
                usuario = await transaccionPrisma.usuario.update({
                    where: { id_usuario: usuario.id_usuario },
                    data: {
                        nombres: datosDocente.nombres,
                        apellidos: datosDocente.apellidos,
                        id_rol: datosDocente.id_rol
                    }
                });
            }

            const docenteCreado = await transaccionPrisma.docente.create({
                data: {
                    id_docente: usuario.id_usuario,
                    identificacion: datosDocente.identificacion.trim(),
                    telefono: datosDocente.telefono,
                    horas_semanales_maximas: datosDocente.horas_semanales_maximas,
                    tipo_contrato: datosDocente.tipo_contrato
                },
                include: {
                    usuario: true
                }
            });

            return docenteCreado;
        });
    }

    /**
     * Objetivo: Actualizar un docente.
     */
    async actualizarDocente(idDocente, datosActualizar) {
        return await clientePrisma.$transaction(async (transaccionPrisma) => {
            // Actualizar datos del usuario base
            if (datosActualizar.nombres || datosActualizar.apellidos || datosActualizar.correo) {
                await transaccionPrisma.usuario.update({
                    where: { id_usuario: idDocente },
                    data: {
                        nombres: datosActualizar.nombres,
                        apellidos: datosActualizar.apellidos,
                        correo: datosActualizar.correo
                    }
                });
            }

            // Actualizar datos específicos del docente
            const docenteActualizado = await transaccionPrisma.docente.update({
                where: { id_docente: idDocente },
                data: {
                    identificacion: datosActualizar.identificacion ? datosActualizar.identificacion.trim() : undefined,
                    telefono: datosActualizar.telefono,
                    horas_semanales_maximas: datosActualizar.horas_semanales_maximas,
                    tipo_contrato: datosActualizar.tipo_contrato
                },
                include: {
                    usuario: true
                }
            });

            return docenteActualizado;
        });
    }

    /**
     * Objetivo: Verificar si el docente tiene horarios programados activos.
     */
    async tieneHorariosAsociados(idDocente) {
        const contadorHorarios = await clientePrisma.horario.count({
            where: {
                id_docente: idDocente
            }
        });
        return contadorHorarios > 0;
    }

    /**
     * Objetivo: Eliminar físicamente un docente y su usuario base (Cascading).
     */
    async eliminarDocente(idDocente) {
        return await clientePrisma.$transaction(async (transaccionPrisma) => {
            // Borrar primero el perfil del docente
            await transaccionPrisma.docente.delete({
                where: { id_docente: idDocente }
            });

            // Borrar el usuario correspondiente
            return await transaccionPrisma.usuario.delete({
                where: { id_usuario: idDocente }
            });
        });
    }
}

module.exports = ServicioDocente;
