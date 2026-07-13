import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio API del Frontend para consumir los endpoints del módulo de seguridad.
 * Caso de uso: UC-Security (Módulo de Seguridad y RBAC)
 * Fecha: 2026-07-12
 */
class ServicioSeguridad {
  // ==========================================
  // USUARIOS
  // ==========================================
  async obtenerUsuarios() {
    const res = await clienteApi.get("/seguridad/usuarios");
    return res.data.usuarios;
  }

  async crearUsuario(datos) {
    const res = await clienteApi.post("/autenticacion/registro", datos);
    return res.data;
  }

  async actualizarUsuario(id, datos) {
    const res = await clienteApi.put(`/seguridad/usuarios/${id}`, datos);
    return res.data;
  }

  async cambiarEstadoUsuario(id, activo) {
    const res = await clienteApi.put(`/seguridad/usuarios/${id}/activo`, { activo });
    return res.data;
  }

  async cambiarContrasenaUsuario(id, contrasena) {
    const res = await clienteApi.put(`/seguridad/usuarios/${id}/contrasena`, { contrasena });
    return res.data;
  }

  async eliminarUsuario(id) {
    const res = await clienteApi.delete(`/seguridad/usuarios/${id}`);
    return res.data;
  }

  async obtenerHistorialUsuario(id) {
    const res = await clienteApi.get(`/seguridad/usuarios/${id}/historial`);
    return res.data.historial;
  }

  // ==========================================
  // ROLES
  // ==========================================
  async obtenerRoles() {
    const res = await clienteApi.get("/seguridad/roles");
    return res.data.roles;
  }

  async crearRol(datos) {
    const res = await clienteApi.post("/seguridad/roles", datos);
    return res.data;
  }

  async actualizarRol(id, datos) {
    const res = await clienteApi.put(`/seguridad/roles/${id}`, datos);
    return res.data;
  }

  async cambiarEstadoRol(id, activo) {
    const res = await clienteApi.put(`/seguridad/roles/${id}/activo`, { activo });
    return res.data;
  }

  async eliminarRol(id) {
    const res = await clienteApi.delete(`/seguridad/roles/${id}`);
    return res.data;
  }

  // ==========================================
  // PERMISOS
  // ==========================================
  async obtenerPermisos() {
    const res = await clienteApi.get("/seguridad/permisos");
    return res.data.permisos;
  }

  async obtenerPermisosRol(idRol) {
    const res = await clienteApi.get(`/seguridad/roles/${idRol}/permisos`);
    return res.data.permisos;
  }

  async guardarPermisosRol(idRol, permisos) {
    const res = await clienteApi.post(`/seguridad/roles/${idRol}/permisos`, { permisos });
    return res.data;
  }

  // ==========================================
  // AUDITORÍA
  // ==========================================
  async obtenerAuditoria(filtros = {}) {
    const res = await clienteApi.get("/seguridad/auditoria", { params: filtros });
    return res.data.logs;
  }
}

const servicioSeguridad = new ServicioSeguridad();
export default servicioSeguridad;
