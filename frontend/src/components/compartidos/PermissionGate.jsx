"use client";

import React from "react";
import { useAutenticacion } from "../../context/ContextoAutenticacion";

/**
 * Propósito: Componente de renderizado condicional basado en permisos dinámicos (RBAC).
 * Caso de uso: UC-Security (Control de acceso a componentes de interfaz)
 * Requisitos relacionados: RF8
 * Fecha: 2026-07-12
 */
export default function PermissionGate({ permission, children, fallback = null }) {
  const { tienePermiso } = useAutenticacion();

  if (!tienePermiso(permission)) {
    return fallback;
  }

  return <>{children}</>;
}
