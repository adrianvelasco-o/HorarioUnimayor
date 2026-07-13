import React from "react";

/**
 * Propósito: Componente de entrada de texto institucional accesible.
 * Caso de uso: UC-1 al UC-34 (Formularios del sistema)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la captura de información)
 * Fecha: 2026-07-11
 */
export default function InputText({
  label,
  nombre,
  registro = {},
  error = null,
  tipo = "text",
  ayuda = "",
  placeholder = "",
  autoFocus = false,
  className = "",
  ...propiedadesAdicionales
}) {
  const idInput = `input-${nombre}`;
  const idError = `error-${nombre}`;
  const idAyuda = `ayuda-${nombre}`;

  // Vincular descriptores de accesibilidad
  const descriptores = [];
  if (error) descriptores.push(idError);
  if (ayuda) descriptores.push(idAyuda);
  const ariaDescribedBy = descriptores.length > 0 ? descriptores.join(" ") : undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label
        htmlFor={idInput}
        className="text-sm font-semibold text-gray-700 select-none cursor-pointer"
      >
        {label}
      </label>
      <input
        id={idInput}
        type={tipo}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={ariaDescribedBy}
        className={`px-3 py-2 border rounded-md text-sm transition-all duration-200 focus:outline-none bg-white text-gray-800 ${
          error
            ? "border-error focus:border-error focus:ring-1 focus:ring-error"
            : "border-gray-300 focus:border-azul-principal focus:ring-1 focus:ring-azul-principal"
        }`}
        {...registro}
        {...propiedadesAdicionales}
      />
      {ayuda && (
        <span
          id={idAyuda}
          className="text-xs text-gray-500 font-normal"
        >
          {ayuda}
        </span>
      )}
      {error && (
        <span
          id={idError}
          role="alert"
          className="text-xs font-semibold text-error mt-0.5"
          aria-live="assertive"
        >
          {error.message}
        </span>
      )}
    </div>
  );
}
