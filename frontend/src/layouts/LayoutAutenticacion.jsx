import React from "react";

/**
 * Propósito: Layout envoltorio para los flujos de inicio de sesión y registro.
 * Caso de uso: UC-1, UC-2 (Autenticación y Registro)
 * Requisitos relacionados: RF1, RF2
 * Escenarios QAW: QS-4 (Identidad visual unificada de seguridad)
 * Fecha: 2026-07-11
 */
export default function LayoutAutenticacion({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-fondo px-4 py-12 sm:px-6 lg:px-8 select-none">
      {/* Fondo con Degradado Corporativo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-azul-secundario/90 to-azul-principal/95 -z-10"></div>
      
      {/* Contenedor del Formulario */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Encabezado Corporativo */}
        <div className="bg-azul-principal px-6 py-8 text-center flex flex-col items-center gap-3">
          {/* Escudo Institucional */}
          <img
            src="/logo.png"
            alt="Logo HorarioUniMayor"
            className="w-12 h-12 object-contain"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              HorarioUniMayor
            </h1>
            <p className="text-xs text-gray-200 font-medium">
              Institución Universitaria Colegio Mayor del Cauca
            </p>
          </div>
        </div>

        {/* Contenido Dinámico (Login/Registro) */}
        <main className="p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* Footer Institucional de Seguridad */}
      <footer className="mt-8 text-center text-xs text-white/70 font-medium">
        <span>© 2026 HorarioUniMayor. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}
