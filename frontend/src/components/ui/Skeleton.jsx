import React from "react";

/**
 * Propósito: Placeholder animado (Skeleton) de carga para mejorar la experiencia percibida.
 * Caso de uso: UC-1 al UC-34 (Cargas asíncronas de listados y tarjetas)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Transiciones e indicadores visuales de estado)
 * Fecha: 2026-07-11
 */
export default function Skeleton({
  variante = "texto",
  lineas = 1,
  className = "",
}) {
  const clasesBase = "bg-gray-200 animate-pulse rounded";

  const clasesVariantes = {
    texto: "h-4 w-full",
    circulo: "rounded-full",
    rectangulo: "w-full h-32",
  };

  const renderizarLineas = () => {
    return Array.from({ length: lineas }).map((_, index) => (
      <div
        key={index}
        className={`${clasesBase} ${clasesVariantes.texto} ${
          index > 0 && index === lineas - 1 ? "w-4/5" : ""
        } ${className}`}
        style={{ animationDelay: `${index * 100}ms` }}
      ></div>
    ));
  };

  return (
    <div
      role="progressbar"
      aria-valuetext="Cargando contenido..."
      aria-busy="true"
      className="flex flex-col gap-2 w-full"
    >
      {variante === "texto" ? (
        renderizarLineas()
      ) : (
        <div className={`${clasesBase} ${clasesVariantes[variante]} ${className}`}></div>
      )}
    </div>
  );
}
