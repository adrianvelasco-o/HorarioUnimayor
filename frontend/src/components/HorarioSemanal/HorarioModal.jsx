import React from "react";
import Modal from "../ui/Modal";
import Boton from "../ui/Boton";
import { getDuracion } from "./horario.utils";
import { FiClock, FiMapPin, FiUser, FiBookOpen, FiLayers, FiAlertCircle, FiTrash2 } from "react-icons/fi";

export default function HorarioModal({ abierto, alCerrar, horario, alEliminar }) {
  if (!horario) return null;

  const esMateria = !!horario.materia;
  const nombre = esMateria ? horario.materia.nombre : horario.labor.nombre;
  const codigo = esMateria ? horario.materia.codigo : "LABOR";
  const duracionText = getDuracion(horario.hora_inicio, horario.hora_fin);

  const docenteNombre = horario.docente?.usuario
    ? `${horario.docente.usuario.nombres} ${horario.docente.usuario.apellidos}`
    : horario.docente_nombre || "No especificado";

  const docenteIdentificacion = horario.docente?.identificacion || "N/A";
  const docenteContrato = horario.docente?.tipo_contrato ? horario.docente.tipo_contrato.replace("_", " ") : "N/A";

  const salonNombre = horario.salon?.nombre || "Sin salón asignado";
  const salonUbicacion = horario.salon?.ubicacion || "Sede Principal";
  const salonTipo = horario.salon?.tipo ? horario.salon.tipo.replace("_", " ") : "N/A";
  const salonCapacidad = horario.salon?.capacidad || "N/A";

  const periodoNombre = horario.periodo?.nombre || "N/A";
  const tipoClase = esMateria ? (horario.materia.tipo || "Presencial") : "Labor Académica";
  const observaciones = esMateria 
    ? `Créditos académicos: ${horario.materia.creditos || 0}`
    : (horario.labor.descripcion || "Actividad académica sin observaciones registradas.");

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Detalle de Programación Académica"
    >
      <div className="flex flex-col gap-5 text-left select-none">
        {/* Actividad Principal */}
        <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${
            esMateria ? "bg-blue-50 text-azul-principal" : "bg-purple-50 text-purple-600"
          }`}>
            {esMateria ? <FiBookOpen className="w-6 h-6" /> : <FiLayers className="w-6 h-6" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border self-start ${
              esMateria 
                ? "bg-blue-50 text-azul-principal border-blue-100" 
                : "bg-purple-50 text-purple-600 border-purple-100"
            }`}>
              {codigo} • {esMateria ? "Asignatura" : "Labor"}
            </span>
            <h3 className="text-base font-bold text-gray-800 mt-1 leading-tight">{nombre}</h3>
          </div>
        </div>

        {/* Detalles en Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Horario y Duración */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Día y Horario</span>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <FiClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{horario.dia_semana} • {horario.hora_inicio} - {horario.hora_fin}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium pl-6">Duración: {duracionText}</span>
          </div>

          {/* Periodo y Tipo */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Periodo / Tipo</span>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <FiAlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{periodoNombre} • <span className="capitalize">{tipoClase.toLowerCase()}</span></span>
            </div>
          </div>

          {/* Docente */}
          <div className="flex flex-col gap-1 border-t border-gray-50 pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Docente Encargado</span>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{docenteNombre}</span>
            </div>
            {horario.docente && (
              <span className="text-[10px] text-gray-400 font-medium pl-6">
                ID: {docenteIdentificacion} ({docenteContrato})
              </span>
            )}
          </div>

          {/* Salón */}
          <div className="flex flex-col gap-1 border-t border-gray-50 pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Salón / Ambiente</span>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{salonNombre}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium pl-6">
              {salonUbicacion} • {salonTipo} (Cap: {salonCapacidad})
            </span>
          </div>
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1 bg-gray-50 border border-gray-100 p-3 rounded-md mt-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Observaciones / Detalles</span>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            {observaciones}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
          <Boton
            variante="secundario"
            alHacerClic={alCerrar}
          >
            Cerrar Detalles
          </Boton>
          {alEliminar && (
            <Boton
              variante="peligro"
              alHacerClic={() => {
                alCerrar();
                alEliminar(horario);
              }}
              icono={FiTrash2}
            >
              Eliminar Horario
            </Boton>
          )}
        </div>
      </div>
    </Modal>
  );
}
