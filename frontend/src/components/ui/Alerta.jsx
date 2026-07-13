import React from "react";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from "react-icons/fi";

/**
 * Propósito: Mensajes de alerta semánticos y accesibles.
 * Caso de uso: UC-1 al UC-34 (Mensajes de retroalimentación de estado)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Visibilidad del estado del sistema)
 * Fecha: 2026-07-11
 */
export default function Alerta({
  tipo = "informacion",
  titulo = "",
  mensaje = "",
  className = "",
}) {
  const configuraciones = {
    exito: {
      clasesFondo: "bg-green-50 border-green-400 text-green-800",
      Icono: FiCheckCircle,
      role: "status",
      ariaLive: "polite",
    },
    advertencia: {
      clasesFondo: "bg-yellow-50 border-yellow-400 text-yellow-800",
      Icono: FiAlertTriangle,
      role: "alert",
      ariaLive: "assertive",
    },
    error: {
      clasesFondo: "bg-red-50 border-red-400 text-red-800",
      Icono: FiXCircle,
      role: "alert",
      ariaLive: "assertive",
    },
    informacion: {
      clasesFondo: "bg-blue-50 border-blue-400 text-blue-800",
      Icono: FiInfo,
      role: "status",
      ariaLive: "polite",
    },
  };

  const configActual = configuraciones[tipo] || configuraciones.informacion;
  const { clasesFondo, Icono, role, ariaLive } = configActual;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`flex gap-3 p-4 border-l-4 rounded-md shadow-sm select-none ${clasesFondo} ${className}`}
    >
      <div className="flex-shrink-0">
        <Icono className="w-5 h-5 mt-0.5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-0.5">
        {titulo && <h3 className="font-semibold text-sm">{titulo}</h3>}
        {mensaje && <p className="text-sm font-medium opacity-90">{mensaje}</p>}
      </div>
    </div>
  );
}
