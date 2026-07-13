"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import servicioAutenticacion from "../services/servicioAutenticacion";

/**
 * Propósito: Contexto de estado global para la gestión de la sesión y autenticación del usuario.
 * Caso de uso: UC-1, UC-2 (Autenticación y Registro)
 * Requisitos relacionados: RF1, RF2, RF3
 * Escenarios QAW: QS-1 (Control de accesos y seguridad RBAC)
 * Fecha: 2026-07-11
 */

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Leer estado de la sesión guardada al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token_jwt");
    const usuarioGuardado = localStorage.getItem("usuario_sesion");

    Promise.resolve().then(() => {
      if (token && usuarioGuardado) {
        try {
          setUsuario(JSON.parse(usuarioGuardado));
        } catch (errorParseo) {
          localStorage.removeItem("token_jwt");
          localStorage.removeItem("usuario_sesion");
        }
      }
      setCargando(false);
    });
  }, []);

  /**
   * Objetivo: Iniciar sesión institucional.
   */
  const iniciarSesion = async (correo, contrasena) => {
    try {
      const datosRespuesta = await servicioAutenticacion.iniciarSesion(correo, contrasena);

      const { tokenAcceso, usuario: datosUsuario } = datosRespuesta;

      localStorage.setItem("token_jwt", tokenAcceso);
      localStorage.setItem("usuario_sesion", JSON.stringify(datosUsuario));
      setUsuario(datosUsuario);

      return { exitoso: true };
    } catch (errorApi) {
      const mensajeError = errorApi.response?.data?.mensaje || "Error al intentar conectar con el servidor.";
      return { exitoso: false, mensaje: mensajeError };
    }
  };

  /**
   * Objetivo: Cerrar sesión limpiando credenciales locales.
   */
  const cerrarSesion = () => {
    localStorage.removeItem("token_jwt");
    localStorage.removeItem("usuario_sesion");
    setUsuario(null);
    window.location.href = "/login";
  };

  /**
   * Objetivo: Verificar si el usuario posee un permiso granular específico.
   */
  const tienePermiso = (codigoPermiso) => {
    if (!usuario) return false;
    // Si el usuario es Administrador o el permiso está explícitamente concedido, retorna true
    if (usuario.rol === "Administrador") return true;
    return !!(usuario.permisos && usuario.permisos.includes(codigoPermiso));
  };

  const valorContexto = {
    usuario,
    cargando,
    iniciarSesion,
    cerrarSesion,
    tienePermiso,
    autenticado: !!usuario,
  };

  return (
    <ContextoAutenticacion.Provider value={valorContexto}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error("useAutenticacion debe utilizarse dentro del ProveedorAutenticacion.");
  }
  return contexto;
}
