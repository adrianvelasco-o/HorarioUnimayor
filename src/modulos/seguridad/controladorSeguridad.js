/**
 * Propósito: Controlador para interceptar, validar y despachar peticiones HTTP del Módulo de Seguridad.
 * Caso de uso: UC-Security (Seguridad y Auditoría del Sistema)
 * Requisitos relacionados: RF-Seguridad-01 al RF-Seguridad-05
 * Patrones de diseño: Singleton / Controller
 * Principios SOLID: SRP, LSP
 * Fecha: 2026-07-12
 */

const bcrypt = require("bcrypt");
const ServicioSeguridad = require("./servicioSeguridad");
const loggerAuditoria = require("../../configuracion/logger");

class ControladorSeguridad {
    static #instancia = null;

    constructor() {
        this.servicioSeguridad = new ServicioSeguridad();
    }

    /**
     * Patrón Singleton para el Controlador de Seguridad.
     */
    static obtenerInstancia() {
        if (!ControladorSeguridad.#instancia) {
            ControladorSeguridad.#instancia = new ControladorSeguridad();
        }
        return ControladorSeguridad.#instancia;
    }

    // ==========================================
    // CONTROLADORES DE USUARIOS
    // ==========================================

    async listarUsuarios(peticion, respuesta) {
        try {
            const usuarios = await this.servicioSeguridad.listarUsuarios();
            // Retornar datos sin la contraseña por seguridad
            const usuariosSeguros = usuarios.map(u => {
                const { contrasena, ...usrSinClave } = u;
                return usrSinClave;
            });

            return respuesta.status(200).json({
                exitoso: true,
                usuarios: usuariosSeguros
            });
        } catch (error) {
            loggerAuditoria.error(`Error en listarUsuarios: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al listar los usuarios."
            });
        }
    }

    async actualizarUsuario(peticion, respuesta) {
        const idUsuario = parseInt(peticion.params.id);
        const { nombres, apellidos, id_rol } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const usuarioExistente = await this.servicioSeguridad.buscarUsuarioPorId(idUsuario);
            if (!usuarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El usuario a actualizar no existe."
                });
            }

            const usuarioActualizado = await this.servicioSeguridad.actualizarUsuario(idUsuario, {
                nombres,
                apellidos,
                id_rol: parseInt(id_rol)
            });

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "MODIFICAR_USUARIO",
                `Se actualizaron los datos del usuario ${usuarioExistente.correo}. Nuevo rol ID: ${id_rol}`,
                peticion.ip
            );

            loggerAuditoria.info(`Usuario ID ${idUsuario} actualizado por Administrador ID ${idAdmin}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Usuario actualizado exitosamente.",
                usuario: usuarioActualizado
            });
        } catch (error) {
            loggerAuditoria.error(`Error en actualizarUsuario: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al actualizar el usuario."
            });
        }
    }

    async cambiarEstadoUsuario(peticion, respuesta) {
        const idUsuario = parseInt(peticion.params.id);
        const { activo } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            // Evitar que el administrador se desactive a sí mismo
            if (idUsuario === idAdmin) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Restricción de seguridad: Un administrador no puede desactivar su propia cuenta."
                });
            }

            const usuarioExistente = await this.servicioSeguridad.buscarUsuarioPorId(idUsuario);
            if (!usuarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El usuario no existe."
                });
            }

            await this.servicioSeguridad.cambiarEstadoUsuario(idUsuario, activo);

            // Auditoría
            const accionLabel = activo ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO";
            const detalleLabel = activo ? "activó" : "desactivó";
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                accionLabel,
                `El administrador ${detalleLabel} la cuenta del usuario: ${usuarioExistente.correo}`,
                peticion.ip
            );

            loggerAuditoria.info(`Estado del usuario ID ${idUsuario} cambiado a ${activo} por Admin ID ${idAdmin}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.`
            });
        } catch (error) {
            loggerAuditoria.error(`Error en cambiarEstadoUsuario: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al cambiar el estado del usuario."
            });
        }
    }

    async cambiarContrasenaUsuario(peticion, respuesta) {
        const idUsuario = parseInt(peticion.params.id);
        const { contrasena } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const usuarioExistente = await this.servicioSeguridad.buscarUsuarioPorId(idUsuario);
            if (!usuarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El usuario seleccionado no existe."
                });
            }

            if (!contrasena || contrasena.length < 6) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "La contraseña debe contener al menos 6 caracteres."
                });
            }

            const contrasenaCifrada = await bcrypt.hash(contrasena, 10);
            await this.servicioSeguridad.cambiarContrasenaUsuario(idUsuario, contrasenaCifrada);

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "CAMBIO_CONTRASENA",
                `El administrador restableció la contraseña para el usuario: ${usuarioExistente.correo}`,
                peticion.ip
            );

            loggerAuditoria.info(`Contraseña restablecida para el usuario ID ${idUsuario} por Admin ID ${idAdmin}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Contraseña actualizada exitosamente."
            });
        } catch (error) {
            loggerAuditoria.error(`Error en cambiarContrasenaUsuario: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al cambiar la contraseña."
            });
        }
    }

    async eliminarUsuario(peticion, respuesta) {
        const idUsuario = parseInt(peticion.params.id);
        const idAdmin = peticion.usuario.idUsuario;

        try {
            // Un administrador no puede eliminarse a sí mismo
            if (idUsuario === idAdmin) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Restricción de seguridad: No puede eliminarse a sí mismo de la plataforma."
                });
            }

            const usuarioExistente = await this.servicioSeguridad.buscarUsuarioPorId(idUsuario);
            if (!usuarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El usuario a eliminar no existe."
                });
            }

            await this.servicioSeguridad.eliminarUsuario(idUsuario);

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "ELIMINAR_USUARIO",
                `Se eliminó permanentemente la cuenta del usuario: ${usuarioExistente.correo}`,
                peticion.ip
            );

            loggerAuditoria.info(`Usuario ID ${idUsuario} eliminado por Admin ID ${idAdmin}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Usuario eliminado de la plataforma exitosamente."
            });
        } catch (error) {
            loggerAuditoria.error(`Error en eliminarUsuario: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error al intentar eliminar el usuario (probablemente posee dependencias activas)."
            });
        }
    }

    async obtenerHistorialUsuario(peticion, respuesta) {
        const idUsuario = parseInt(peticion.params.id);

        try {
            const usuarioExistente = await this.servicioSeguridad.buscarUsuarioPorId(idUsuario);
            if (!usuarioExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El usuario no existe."
                });
            }

            const historial = await this.servicioSeguridad.obtenerHistorialUsuario(idUsuario);

            return respuesta.status(200).json({
                exitoso: true,
                historial
            });
        } catch (error) {
            loggerAuditoria.error(`Error en obtenerHistorialUsuario: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al consultar el historial."
            });
        }
    }

    // ==========================================
    // CONTROLADORES DE ROLES
    // ==========================================

    async listarRoles(peticion, respuesta) {
        try {
            const roles = await this.servicioSeguridad.listarRoles();
            return respuesta.status(200).json({
                exitoso: true,
                roles
            });
        } catch (error) {
            loggerAuditoria.error(`Error en listarRoles: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al listar los roles."
            });
        }
    }

    async crearRol(peticion, respuesta) {
        const { nombre, descripcion } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            if (!nombre || nombre.trim().length === 0) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "El nombre del rol es requerido."
                });
            }

            const nuevoRol = await this.servicioSeguridad.crearRol({ nombre, descripcion });

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "CREAR_ROL",
                `Creación del rol institucional: ${nombre}`,
                peticion.ip
            );

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Rol creado exitosamente.",
                rol: nuevoRol
            });
        } catch (error) {
            loggerAuditoria.error(`Error en crearRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error al crear el rol (verifique que no esté duplicado)."
            });
        }
    }

    async actualizarRol(peticion, respuesta) {
        const idRol = parseInt(peticion.params.id);
        const { nombre, descripcion } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const rolExistente = await this.servicioSeguridad.buscarRolPorId(idRol);
            if (!rolExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El rol no existe."
                });
            }

            const rolActualizado = await this.servicioSeguridad.actualizarRol(idRol, { nombre, descripcion });

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "MODIFICAR_ROL",
                `Se modificó el rol ID ${idRol}. Nuevo nombre: ${nombre}`,
                peticion.ip
            );

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Rol actualizado exitosamente.",
                rol: rolActualizado
            });
        } catch (error) {
            loggerAuditoria.error(`Error en actualizarRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error al actualizar el rol."
            });
        }
    }

    async cambiarEstadoRol(peticion, respuesta) {
        const idRol = parseInt(peticion.params.id);
        const { activo } = peticion.body;
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const rolExistente = await this.servicioSeguridad.buscarRolPorId(idRol);
            if (!rolExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El rol no existe."
                });
            }

            await this.servicioSeguridad.cambiarEstadoRol(idRol, activo);

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                activo ? "ACTIVAR_ROL" : "DESACTIVAR_ROL",
                `Se cambió el estado del rol ${rolExistente.nombre} a activo=${activo}`,
                peticion.ip
            );

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: `Rol ${activo ? 'activado' : 'desactivado'} correctamente.`
            });
        } catch (error) {
            loggerAuditoria.error(`Error en cambiarEstadoRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al actualizar estado del rol."
            });
        }
    }

    async eliminarRol(peticion, respuesta) {
        const idRol = parseInt(peticion.params.id);
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const rolExistente = await this.servicioSeguridad.buscarRolPorId(idRol);
            if (!rolExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El rol a eliminar no existe."
                });
            }

            // Restricción: No eliminar roles con usuarios asociados
            const tieneUsuarios = await this.servicioSeguridad.tieneUsuariosAsociados(idRol);
            if (tieneUsuarios) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Restricción: No se puede eliminar un rol que contiene usuarios activos/registrados."
                });
            }

            await this.servicioSeguridad.eliminarRol(idRol);

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "ELIMINAR_ROL",
                `Se eliminó permanentemente el rol: ${rolExistente.nombre}`,
                peticion.ip
            );

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Rol eliminado del sistema exitosamente."
            });
        } catch (error) {
            loggerAuditoria.error(`Error en eliminarRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al intentar eliminar el rol."
            });
        }
    }

    // ==========================================
    // CONTROLADORES DE PERMISOS / MATRIZ
    // ==========================================

    async listarPermisos(peticion, respuesta) {
        try {
            const permisos = await this.servicioSeguridad.listarPermisos();
            return respuesta.status(200).json({
                exitoso: true,
                permisos
            });
        } catch (error) {
            loggerAuditoria.error(`Error en listarPermisos: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error al listar los permisos."
            });
        }
    }

    async obtenerPermisosRol(peticion, respuesta) {
        const idRol = parseInt(peticion.params.id);

        try {
            const rolExistente = await this.servicioSeguridad.buscarRolPorId(idRol);
            if (!rolExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El rol no existe."
                });
            }

            const permisos = await this.servicioSeguridad.obtenerPermisosPorRol(idRol);

            return respuesta.status(200).json({
                exitoso: true,
                permisos
            });
        } catch (error) {
            loggerAuditoria.error(`Error en obtenerPermisosRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error al obtener los permisos del rol."
            });
        }
    }

    async guardarPermisosRol(peticion, respuesta) {
        const idRol = parseInt(peticion.params.id);
        const { permisos } = peticion.body; // Array de IDs de permisos
        const idAdmin = peticion.usuario.idUsuario;

        try {
            const rolExistente = await this.servicioSeguridad.buscarRolPorId(idRol);
            if (!rolExistente) {
                return respuesta.status(404).json({
                    exitoso: false,
                    mensaje: "El rol no existe."
                });
            }

            if (!Array.isArray(permisos)) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "Los permisos deben suministrarse como un arreglo de enteros."
                });
            }

            await this.servicioSeguridad.guardarPermisosRol(idRol, permisos.map(p => parseInt(p)));

            // Auditoría
            await this.servicioSeguridad.registrarAccionAuditoria(
                idAdmin,
                "ASIGNACION_PERMISOS",
                `Matriz de permisos modificada para el rol: ${rolExistente.nombre}. Permisos totales asignados: ${permisos.length}`,
                peticion.ip
            );

            loggerAuditoria.info(`Matriz de permisos actualizada para Rol ID ${idRol} por Admin ID ${idAdmin}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Matriz de permisos guardada exitosamente."
            });
        } catch (error) {
            loggerAuditoria.error(`Error en guardarPermisosRol: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al guardar la matriz de permisos."
            });
        }
    }

    // ==========================================
    // CONTROLADOR DE AUDITORÍA
    // ==========================================

    async listarAuditoria(peticion, respuesta) {
        const { idUsuario, accion, fechaInicio, fechaFin } = peticion.query;

        try {
            const logs = await this.servicioSeguridad.listarAuditoria({
                idUsuario,
                accion,
                fechaInicio,
                fechaFin
            });

            return respuesta.status(200).json({
                exitoso: true,
                logs
            });
        } catch (error) {
            loggerAuditoria.error(`Error en listarAuditoria: ${error.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al consultar la bitácora de auditoría."
            });
        }
    }
}

module.exports = ControladorSeguridad;
