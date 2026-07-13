import React from "react";
import Spinner from "./Spinner";

/**
 * Propósito: Botón institucional reutilizable con soporte para accesibilidad y estados interactivos.
 * Caso de uso: UC-1 al UC-34 (Disparadores de acciones del CRUD)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la interacción del usuario)
 * Fecha: 2026-07-11
 */
export default function Boton({
  children,
  tipo = "button",
  variante = "principal",
  cargando = false,
  deshabilitado = false,
  icono: Icono = null,
  alHacerClic = () => {},
  className = "",
  ...propiedadesAdicionales
}) {
  const clasesBase = "inline-flex items-center justify-center font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none select-none";

  const clasesVariantes = {
    principal: "bg-azul-principal hover:bg-azul-secundario text-white px-4 py-2.5 shadow-sm active:bg-azul-secundario disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed",
    secundario: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 shadow-sm active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
    peligro: "bg-error hover:bg-red-700 text-white px-4 py-2.5 shadow-sm active:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed",
  };

  const estaDeshabilitado = deshabilitado || cargando;

  return (
    <button
      type={tipo}
      onClick={estaDeshabilitado ? undefined : alHacerClic}
      disabled={estaDeshabilitado}
      aria-disabled={estaDeshabilitado}
      className={`${clasesBase} ${clasesVariantes[variante]} ${className}`}
      {...propiedadesAdicionales}
    >
      {cargando ? (
        <span className="flex items-center gap-2">
          <Spinner tamano="sm" color="blanco" />
          <span>Procesando...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {Icono && <Icono className="w-5 h-5" aria-hidden="true" />}
          {children}
        </span>
      )}
    </button>
  );
}
