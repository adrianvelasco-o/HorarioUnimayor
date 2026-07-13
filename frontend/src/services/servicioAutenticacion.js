import clienteApi from "./clienteApi";

/**
 * Propósito: Servicio de persistencia y consumo HTTP para el módulo de Autenticación
 * Caso de uso: UC-1, UC-2 (Inicio de sesión y Registro de usuarios)
 * Requisitos relacionados: RF1, RF2
 * Escenarios QAW: QS-1 (Seguridad en la transmisión), QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
const servicioAutenticacion = {
  /**
   * Objetivo: Enviar credenciales de acceso al servidor.
   * Parámetros:
   *   - correo: {String} Correo institucional del usuario.
   *   - contrasena: {String} Contraseña del usuario.
   */
  async iniciarSesion(correo, contrasena) {
    const respuesta = await clienteApi.post("/autenticacion/login", {
      correo,
      contrasena,
    });
    return respuesta.data;
  },
};

export default servicioAutenticacion;
