"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import HorarioHeader from "./HorarioHeader";
import HorarioCard from "./HorarioCard";
import HorarioModal from "./HorarioModal";
import { parseTimeToMinutes, ordenarHorarios, getFranjasHorarias } from "./horario.utils";
import { FiCalendar, FiClock, FiInbox } from "react-icons/fi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const DIAS_LABELS = {
  "LUNES": "Lunes",
  "MARTES": "Martes",
  "MIERCOLES": "Miércoles",
  "JUEVES": "Jueves",
  "VIERNES": "Viernes",
  "SABADO": "Sábado"
};

export default function HorarioSemanal({
  horarios = [],
  modo = "compacto",
  alEliminar = null,
  mostrarDocente = true,
  titulo = "Horario Académico",
  subtitulo = "Programación de clases y labores de la semana"
}) {
  const [vistaModo, setVistaModo] = useState(modo);
  const [hoyString, setHoyString] = useState("");
  const [diaSeleccionadoMovil, setDiaSeleccionadoMovil] = useState("LUNES");
  
  // Modal de Detalle
  const [horarioDetalle, setHorarioDetalle] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  useEffect(() => {
    const updateHoy = () => {
      const now = new Date();
      const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
      const hoyStr = dias[now.getDay()];
      setHoyString(hoyStr);
      if (hoyStr !== "DOMINGO") {
        setDiaSeleccionadoMovil(hoyStr);
      }
    };
    updateHoy();
  }, []);

  // 1. Ordenar y preparar horarios (useMemo para evitar cálculos costosos)
  const horariosOrdenados = useMemo(() => {
    return ordenarHorarios(horarios);
  }, [horarios]);

  // 2. Extraer franjas horarias únicas dinámicamente
  const franjasHorarias = useMemo(() => {
    return getFranjasHorarias(horariosOrdenados);
  }, [horariosOrdenados]);

  // Manejar el toggle de modo de vista
  const handleModoToggle = useCallback(() => {
    setVistaModo(prev => prev === "compacto" ? "completo" : "compacto");
  }, []);

  // Manejar la apertura del detalle
  const handleAbrirDetalle = useCallback((horario) => {
    setHorarioDetalle(horario);
    setModalDetalleAbierto(true);
  }, []);

  // Renderizar estado vacío con ilustración SVG
  if (horarios.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px] select-none">
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-full text-gray-400 mb-4">
          <FiInbox className="w-12 h-12" />
        </div>
        <h4 className="text-sm font-bold text-gray-700">No existen horarios registrados</h4>
        <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
          No se encontraron programaciones para los filtros seleccionados o el periodo activo actual.
        </p>
      </div>
    );
  }

  // RENDER MODO COMPACTO (Columnas responsivas en Desktop, Pestañas deslizables + botones en Móvil)
  const renderCompacto = () => {
    return (
      <div className="flex flex-col gap-6">
        {/* VISTA MÓVIL (Un día a la vez con navegación) */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Actividades de Hoy
              </h4>
              {diaSeleccionadoMovil === hoyString && (
                <span className="text-[9px] font-black text-white bg-azul-principal px-1.5 py-0.5 rounded shadow-sm">
                  HOY
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 min-h-[150px]">
              {horariosOrdenados.filter(h => h.dia_semana === diaSeleccionadoMovil).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <FiCalendar className="w-8 h-8 mb-2" />
                  <span className="text-xs font-semibold">Sin clases programadas</span>
                </div>
              ) : (
                horariosOrdenados
                  .filter(h => h.dia_semana === diaSeleccionadoMovil)
                  .map(h => (
                    <HorarioCard
                      key={h.id_horario}
                      horario={h}
                      mostrarDocente={mostrarDocente}
                      onClick={() => handleAbrirDetalle(h)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* VISTA TABLET/ESCRITORIO (Desplazamiento horizontal en tablets, grid completo en escritorio) */}
        <div className="hidden md:block overflow-x-auto">
          <div className="grid grid-cols-6 gap-4 min-w-[900px] pb-2">
            {DIAS.map(dia => {
              const esHoy = dia === hoyString;
              const clasesDia = horariosOrdenados.filter(h => h.dia_semana === dia);

              return (
                <div
                  key={dia}
                  className={`flex flex-col gap-3 p-3 rounded-lg border min-h-[250px] transition-all duration-300 ${
                    esHoy
                      ? "bg-white border-2 border-azul-principal shadow-md ring-1 ring-azul-principal/15"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  {/* Encabezado del día */}
                  <div className="border-b border-gray-100 pb-2 text-center flex flex-col items-center select-none">
                    <span className={`text-xs font-black tracking-wide uppercase ${esHoy ? "text-azul-principal" : "text-gray-500"}`}>
                      {DIAS_LABELS[dia]}
                    </span>
                    {esHoy && (
                      <span className="text-[8px] font-black text-white bg-azul-principal px-1.5 py-0.5 rounded mt-1 shadow-sm">
                        HOY
                      </span>
                    )}
                  </div>

                  {/* Cuerpo/Clases */}
                  <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[400px] pr-0.5">
                    {clasesDia.length === 0 ? (
                      <span className="text-[10px] text-gray-400 text-center py-10 font-medium">
                        Sin actividades
                      </span>
                    ) : (
                      clasesDia.map(h => (
                        <HorarioCard
                          key={h.id_horario}
                          horario={h}
                          mostrarDocente={mostrarDocente}
                          onClick={() => handleAbrirDetalle(h)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // RENDER MODO COMPLETO (Calendario / Grilla estilo Google Calendar)
  const renderCompleto = () => {
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-[900px] w-full divide-y divide-gray-200 table-fixed border-collapse select-none">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-28 px-3 py-3.5 text-center text-xs font-bold text-gray-500 uppercase border-r border-gray-200 font-sans">
                Hora
              </th>
              {DIAS.map(dia => {
                const esHoy = dia === hoyString;
                return (
                  <th
                    key={dia}
                    className={`px-4 py-3.5 text-center text-xs font-bold uppercase border-r border-gray-200 ${
                      esHoy ? "bg-azul-principal text-white font-sans" : "text-gray-600 font-sans"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{DIAS_LABELS[dia]}</span>
                      {esHoy && (
                        <span className="text-[8px] font-black tracking-widest text-white uppercase mt-0.5">HOY</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-xs">
            {franjasHorarias.map(hora => {
              return (
                <tr key={hora} className="hover:bg-gray-50/20">
                  <td className="px-3 py-4 text-center font-bold text-gray-700 bg-gray-50/50 border-r border-gray-200 whitespace-nowrap">
                    <span className="block text-xs font-bold">{hora}</span>
                  </td>
                  {DIAS.map(dia => {
                    // Buscar coincidencia en este bloque
                    const item = horariosOrdenados.find(
                      h => h.dia_semana === dia && h.hora_inicio === hora
                    );

                    const esHoy = dia === hoyString;

                    if (!item) {
                      return (
                        <td
                          key={dia}
                          className={`p-1 border-r border-gray-200 bg-transparent ${esHoy ? "bg-azul-principal/5" : ""}`}
                        />
                      );
                    }

                    return (
                      <td
                        key={dia}
                        className={`p-1.5 border-r border-gray-200 align-top ${esHoy ? "bg-azul-principal/5" : ""}`}
                      >
                        <HorarioCard
                          horario={item}
                          mostrarDocente={mostrarDocente}
                          onClick={() => handleAbrirDetalle(item)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tarjeta de Calendario */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header integrado */}
        <HorarioHeader
          diaSeleccionado={diaSeleccionadoMovil}
          onDiaChange={setDiaSeleccionadoMovil}
          vistaModo={vistaModo}
          onModoToggle={handleModoToggle}
          titulo={titulo}
          subtitulo={subtitulo}
        />

        <div className="p-5">
          {vistaModo === "compacto" ? renderCompacto() : renderCompleto()}
        </div>
      </div>

      {/* Modal de Detalle */}
      <HorarioModal
        abierto={modalDetalleAbierto}
        alCerrar={() => setModalDetalleAbierto(false)}
        horario={horarioDetalle}
        alEliminar={alEliminar}
      />
    </div>
  );
}
