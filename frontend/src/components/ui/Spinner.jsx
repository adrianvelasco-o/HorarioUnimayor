import React from "react";

/**
 * Propósito: Spinner / Cargador institucional animado y accesible.
 * Caso de uso: UC-1 al UC-34 (Indicadores de carga transversales)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Experiencia de usuario y accesibilidad en operaciones asíncronas)
 * Fecha: 2026-07-11
 */
export default function Spinner({ tamano = "md", color = "principal" }) {
  const clasesTamano = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const clasesColor = {
    principal: "border-azul-principal border-t-transparent",
    secundario: "border-azul-secundario border-t-transparent",
    blanco: "border-white border-t-transparent",
  };

  return (
    <div
      role="status"
      className="flex items-center justify-center"
      aria-live="polite"
    >
      <div
        className={`animate-spin rounded-full ${clasesTamano[tamano]} ${clasesColor[color]}`}
      ></div>
      <span className="sr-only">Cargando información...</span>
    </div>
  );
}
