import React from "react";
import { FiClock, FiMapPin, FiUser } from "react-icons/fi";

export default function HorarioCard({ horario, onClick, mostrarDocente = true }) {
  const esMateria = !!horario.materia;
  const nombre = esMateria ? horario.materia.nombre : horario.labor.nombre;
  const codigo = esMateria ? horario.materia.codigo : "LABOR";
  const docenteNombre = horario.docente?.usuario
    ? `${horario.docente.usuario.nombres} ${horario.docente.usuario.apellidos}`
    : horario.docente_nombre || null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-3 rounded-lg border border-gray-200 border-l-4 bg-white text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-azul-principal flex flex-col gap-1.5 select-none ${
        esMateria ? "border-l-azul-principal" : "border-l-purple-600"
      }`}
      title={`${nombre} (${horario.hora_inicio} - ${horario.hora_fin})`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-black text-gray-500 flex items-center gap-1">
          <FiClock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {horario.hora_inicio} - {horario.hora_fin}
        </span>
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
          esMateria 
            ? "bg-blue-50 text-azul-principal border-blue-100" 
            : "bg-purple-50 text-purple-600 border-purple-100"
        }`}>
          {codigo}
        </span>
      </div>

      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
        {nombre}
      </h4>

      <div className="flex flex-col gap-1 mt-1 text-[10px] font-semibold text-gray-400">
        <span className="flex items-center gap-1.5">
          <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {horario.salon?.nombre || "Sin salón"}
        </span>
        
        {mostrarDocente && docenteNombre && (
          <span className="flex items-center gap-1.5 text-gray-500 font-bold truncate">
            <FiUser className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {docenteNombre}
          </span>
        )}
      </div>
    </div>
  );
}
