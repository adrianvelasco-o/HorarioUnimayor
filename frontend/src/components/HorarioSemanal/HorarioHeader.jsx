import React from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiArrowRight } from "react-icons/fi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const DIAS_LABELS = {
  "LUNES": "Lunes",
  "MARTES": "Martes",
  "MIERCOLES": "Miércoles",
  "JUEVES": "Jueves",
  "VIERNES": "Viernes",
  "SABADO": "Sábado"
};

export default function HorarioHeader({
  diaSeleccionado,
  onDiaChange,
  vistaModo,
  onModoToggle,
  titulo = "Horario Académico",
  subtitulo = "Programación de clases y labores de la semana"
}) {
  const navegarDia = (direccion) => {
    const currentIndex = DIAS.indexOf(diaSeleccionado);
    let nextIndex = currentIndex + direccion;
    
    if (nextIndex < 0) {
      nextIndex = DIAS.length - 1;
    } else if (nextIndex >= DIAS.length) {
      nextIndex = 0;
    }
    
    onDiaChange(DIAS[nextIndex]);
  };

  return (
    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
      <div className="flex flex-col gap-0.5 text-left">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-azul-principal" /> {titulo}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {subtitulo}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        {/* Navegación móvil (visible solo en md:hidden cuando es modo compacto) */}
        {vistaModo === "compacto" && (
          <div className="flex md:hidden items-center gap-2 border border-gray-200 rounded-md p-1 bg-gray-50/50">
            <button
              type="button"
              onClick={() => navegarDia(-1)}
              className="p-1 hover:bg-gray-200 rounded text-gray-600 focus:outline-none cursor-pointer border-0 bg-transparent"
              aria-label="Día anterior"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-700 min-w-[70px] text-center">
              {DIAS_LABELS[diaSeleccionado]}
            </span>
            <button
              type="button"
              onClick={() => navegarDia(1)}
              className="p-1 hover:bg-gray-200 rounded text-gray-600 focus:outline-none cursor-pointer border-0 bg-transparent"
              aria-label="Día siguiente"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón de alternancia de vista */}
        <button
          type="button"
          onClick={onModoToggle}
          className="flex items-center gap-1.5 text-xs font-black text-azul-principal hover:text-azul-secundario transition-colors focus:outline-none bg-transparent border-0 cursor-pointer"
        >
          <span>{vistaModo === "compacto" ? "Ver horario completo" : "Ver vista rápida"}</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
