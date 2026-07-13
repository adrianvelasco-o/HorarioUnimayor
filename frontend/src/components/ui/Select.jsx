import React from "react";

/**
 * Propósito: Componente selector desplegable institucional accesible.
 * Caso de uso: UC-1 al UC-34 (Formularios con opciones cerradas)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Estandarización de componentes de control)
 * Fecha: 2026-07-11
 */
export default function Select({
  label,
  nombre,
  opciones = [],
  registro = {},
  error = null,
  ayuda = "",
  placeholder = "Seleccione una opción",
  className = "",
  deshabilitado = false,
  children,
  ...propiedadesAdicionales
}) {
  const idSelect = `select-${nombre}`;
  const idError = `error-${nombre}`;
  const idAyuda = `ayuda-${nombre}`;

  const descriptores = [];
  if (error) descriptores.push(idError);
  if (ayuda) descriptores.push(idAyuda);
  const ariaDescribedBy = descriptores.length > 0 ? descriptores.join(" ") : undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label
        htmlFor={idSelect}
        className="text-sm font-semibold text-gray-700 select-none cursor-pointer"
      >
        {label}
      </label>
      <select
        id={idSelect}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={ariaDescribedBy}
        disabled={deshabilitado}
        className={`px-3 py-2 border rounded-md text-sm transition-all duration-200 focus:outline-none bg-white text-gray-800 cursor-pointer ${
          error
            ? "border-error focus:border-error focus:ring-1 focus:ring-error"
            : "border-gray-300 focus:border-azul-principal focus:ring-1 focus:ring-azul-principal"
        }`}
        {...registro}
        {...propiedadesAdicionales}
      >
        {children ? (
          children
        ) : (
          <>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {opciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </>
        )}
      </select>
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
