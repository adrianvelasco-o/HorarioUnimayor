import React from "react";

/**
 * Propósito: Contenedor tipo Tarjeta (Card) institucional y estructurado.
 * Caso de uso: UC-1 al UC-34 (Paneles informativos y formularios agrupados)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Estructura de maquetación limpia)
 * Fecha: 2026-07-11
 */
export default function Card({
  children,
  titulo = "",
  subtitulo = "",
  acciones = null,
  className = "",
}) {
  return (
    <article
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {(titulo || subtitulo) && (
        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {titulo && (
              <h2 className="text-base font-bold text-gray-800 tracking-tight">
                {titulo}
              </h2>
            )}
            {subtitulo && (
              <p className="text-xs font-normal text-gray-500">
                {subtitulo}
              </p>
            )}
          </div>
          {acciones && <div className="flex items-center gap-2">{acciones}</div>}
        </header>
      )}
      <div className="p-6 flex-1 flex flex-col">{children}</div>
    </article>
  );
}
