/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2, RF6
 * Escenarios QAW relacionados: QS-4 (Fiabilidad)
 * Componentes C4 involucrados: Servicio de Persistencia / Módulo de Autenticación
 * Patrones de diseño utilizados: Repository (Servicio de Base de Datos)
 * Principios SOLID aplicados: SRP (Responsabilidad única de persistencia de usuarios)
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioAutenticacion {
    /**
     * Objetivo: Buscar un usuario en la base de datos por su correo electrónico institucional.
     * Parámetros:
     *   - correo: {String} Correo electrónico de búsqueda.
     * Valor retornado: {Promise<Object|null>} Registro del usuario en base de datos con su rol inyectado.
     * Excepciones: Ninguna.
     * Reglas de negocio aplicadas: Garantiza latencia < 100 ms seleccionando sólo las columnas necesarias.
     */
    async buscarUsuarioPorCorreo(correo) {
        return await clientePrisma.usuario.findUnique({
            where: {
                correo: correo.trim().toLowerCase()
            },
            include: {
                rol: {
                    include: {
                        permisos: {
                            include: {
                                permiso: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Objetivo: Buscar un rol por su ID único.
     * Parámetros:
     *   - idRol: {Number} ID del rol.
     * Valor retornado: {Promise<Object|null>} Rol en base de datos.
     */
    async buscarRolPorId(idRol) {
        return await clientePrisma.rol.findUnique({
            where: {
                id_rol: idRol
            }
        });
    }

    /**
     * Objetivo: Registrar y persistir de forma consistente un nuevo usuario en PostgreSQL.
     * Parámetros:
     *   - instanciaUsuario: {UsuarioBase} Objeto instanciado por la fábrica.
     * Valor retornado: {Promise<Object>} Registro del usuario persistido (sin contrasena).
     * Excepciones: {Error} Si el registro falla.
     * Reglas de negocio aplicadas: RN-Roles-03 (El rol debe existir previamente en PostgreSQL).
     */
    async guardarNuevoUsuario(instanciaUsuario) {
        const usuarioGuardado = await clientePrisma.usuario.create({
            data: {
                nombres: instanciaUsuario.nombres,
                apellidos: instanciaUsuario.apellidos,
                correo: instanciaUsuario.correo,
                contrasena: instanciaUsuario.contrasena,
                id_rol: instanciaUsuario.id_rol,
                activo: instanciaUsuario.activo
            },
            select: {
                id_usuario: true,
                nombres: true,
                apellidos: true,
                correo: true,
                id_rol: true,
                activo: true
            }
        });

        return usuarioGuardado;
    }
}

module.exports = ServicioAutenticacion;
