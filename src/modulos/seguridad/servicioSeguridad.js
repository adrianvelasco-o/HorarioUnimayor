/**
 * Propósito: Servicio de persistencia y reglas de negocio para el Módulo de Seguridad (RBAC y Auditoría).
 * Caso de uso: UC-Security (Gestión de Usuarios, Roles, Permisos y Logs)
 * Requisitos relacionados: RF-Seguridad-01 al RF-Seguridad-05
 * Patrones de diseño: Repository / Service Layer
 * Principios SOLID: SRP, Open-Closed
 * Fecha: 2026-07-12
 */

const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();

class ServicioSeguridad {
    // ==========================================
    // GESTIÓN DE USUARIOS
    // ==========================================

    async listarUsuarios() {
        return await clientePrisma.usuario.findMany({
            include: {
                rol: true
            },
            orderBy: {
                id_usuario: "asc"
            }
        });
    }

    async buscarUsuarioPorId(idUsuario) {
        return await clientePrisma.usuario.findUnique({
            where: { id_usuario: idUsuario },
            include: { rol: true }
        });
    }

    async buscarUsuarioPorCorreo(correo) {
        return await clientePrisma.usuario.findUnique({
            where: { correo: correo.trim().toLowerCase() }
        });
    }

    async crearUsuario(datos) {
        return await clientePrisma.usuario.create({
            data: {
                nombres: datos.nombres,
                apellidos: datos.apellidos,
                correo: datos.correo.trim().toLowerCase(),
                contrasena: datos.contrasena,
                id_rol: datos.id_rol,
                activo: datos.activo ?? true
            }
        });
    }

    async actualizarUsuario(idUsuario, datos) {
        return await clientePrisma.usuario.update({
            where: { id_usuario: idUsuario },
            data: {
                nombres: datos.nombres,
                apellidos: datos.apellidos,
                id_rol: datos.id_rol
            }
        });
    }

    async cambiarEstadoUsuario(idUsuario, activo) {
        return await clientePrisma.usuario.update({
            where: { id_usuario: idUsuario },
            data: { activo }
        });
    }

    async cambiarContrasenaUsuario(idUsuario, contrasenaCifrada) {
        return await clientePrisma.usuario.update({
            where: { id_usuario: idUsuario },
            data: { contrasena: contrasenaCifrada }
        });
    }

    async eliminarUsuario(idUsuario) {
        // En cascada por las FKs (administrador/docente onDelete: Cascade)
        return await clientePrisma.usuario.delete({
            where: { id_usuario: idUsuario }
        });
    }

    // ==========================================
    // GESTIÓN DE ROLES
    // ==========================================

    async listarRoles() {
        return await clientePrisma.rol.findMany({
            orderBy: { id_rol: "asc" }
        });
    }

    async buscarRolPorId(idRol) {
        return await clientePrisma.rol.findUnique({
            where: { id_rol: idRol }
        });
    }

    async crearRol(datos) {
        return await clientePrisma.rol.create({
            data: {
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion
            }
        });
    }

    async actualizarRol(idRol, datos) {
        return await clientePrisma.rol.update({
            where: { id_rol: idRol },
            data: {
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion
            }
        });
    }

    async cambiarEstadoRol(idRol, activo) {
        return await clientePrisma.rol.update({
            where: { id_rol: idRol },
            data: { activo }
        });
    }

    async tieneUsuariosAsociados(idRol) {
        const count = await clientePrisma.usuario.count({
            where: { id_rol: idRol }
        });
        return count > 0;
    }

    async eliminarRol(idRol) {
        return await clientePrisma.rol.delete({
            where: { id_rol: idRol }
        });
    }

    // ==========================================
    // GESTIÓN DE PERMISOS y MATRIZ
    // ==========================================

    async listarPermisos() {
        return await clientePrisma.permiso.findMany({
            orderBy: [{ modulo: "asc" }, { codigo: "asc" }]
        });
    }

    async obtenerPermisosPorRol(idRol) {
        const rolPermisos = await clientePrisma.rolPermiso.findMany({
            where: { id_rol: idRol },
            include: { permiso: true }
        });
        return rolPermisos.map(rp => rp.permiso);
    }

    async guardarPermisosRol(idRol, idsPermisos) {
        return await clientePrisma.$transaction(async (tx) => {
            // 1. Eliminar relaciones anteriores
            await tx.rolPermiso.deleteMany({
                where: { id_rol: idRol }
            });

            // 2. Insertar nuevas relaciones
            const insertPayload = idsPermisos.map(idPermiso => ({
                id_rol: idRol,
                id_permiso: idPermiso
            }));

            if (insertPayload.length > 0) {
                await tx.rolPermiso.createMany({
                    data: insertPayload
                });
            }

            return true;
        });
    }

    // ==========================================
    // AUDITORÍA Y HISTORIAL
    // ==========================================

    async registrarAccionAuditoria(idUsuario, accion, descripcion, ip) {
        return await clientePrisma.historialUsuario.create({
            data: {
                id_usuario: idUsuario,
                accion,
                descripcion,
                ip: ip || "127.0.0.1"
            }
        });
    }

    async obtenerHistorialUsuario(idUsuario) {
        return await clientePrisma.historialUsuario.findMany({
            where: { id_usuario: idUsuario },
            orderBy: { fecha: "desc" }
        });
    }

    async listarAuditoria(filtros = {}) {
        const whereClause = {};

        if (filtros.idUsuario) {
            whereClause.id_usuario = parseInt(filtros.idUsuario);
        }
        if (filtros.accion) {
            whereClause.accion = filtros.accion;
        }
        if (filtros.fechaInicio || filtros.fechaFin) {
            whereClause.fecha = {};
            if (filtros.fechaInicio) {
                whereClause.fecha.gte = new Date(filtros.fechaInicio);
            }
            if (filtros.fechaFin) {
                // Siguiente día a las 00:00 para incluir todo el día de fechaFin
                const finDate = new Date(filtros.fechaFin);
                finDate.setDate(finDate.getDate() + 1);
                whereClause.fecha.lt = finDate;
            }
        }

        return await clientePrisma.historialUsuario.findMany({
            where: whereClause,
            include: {
                usuario: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        correo: true
                    }
                }
            },
            orderBy: {
                fecha: "desc"
            }
        });
    }
}

module.exports = ServicioSeguridad;
