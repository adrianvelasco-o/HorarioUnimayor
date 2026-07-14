"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";
import Card from "../../../components/ui/Card";
import Boton from "../../../components/ui/Boton";
import Tabla from "../../../components/ui/Tabla";
import Modal from "../../../components/ui/Modal";
import InputText from "../../../components/ui/InputText";
import Select from "../../../components/ui/Select";
import Alerta from "../../../components/ui/Alerta";
import Spinner from "../../../components/ui/Spinner";
import HorarioSemanal from "../../../components/HorarioSemanal";
import servicioHorario from "../../../services/servicioHorario";
import servicioPeriodo from "../../../services/servicioPeriodo";
import servicioDocente from "../../../services/servicioDocente";
import servicioSalon from "../../../services/servicioSalon";
import servicioLabor from "../../../services/servicioLabor";
import servicioMateria from "../../../services/servicioMateria";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2, FiClock, FiCalendar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import PermissionGate from "../../../components/compartidos/PermissionGate";

/**
 * Propósito: Pantalla de programación y visualización de Horarios (Bloque 10)
 * Caso de uso: UC-24 al UC-29 (Gestión de Horarios)
 * Requisitos relacionados: RF7, RF13, CAL-03, CAL-12
 * Escenarios QAW: QS-4 (Prevención activa de colisiones e integridad de horarios)
 * Fecha: 2026-07-11
 */
export default function PaginaHorarios() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();
  const esDocente = tienePermiso("MI_HORARIO_VER") && !tienePermiso("HORARIOS_CREAR");

  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");

  // Listas de soporte para el formulario y filtros
  const [docentes, setDocentes] = useState([]);
  const [salones, setSalones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [labores, setLabores] = useState([]);
  const [tiposSalones, setTiposSalones] = useState([]);

  // Estados de filtros avanzados
  const [filtroDocente, setFiltroDocente] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroSalon, setFiltroSalon] = useState("");
  const [filtroTipoSalon, setFiltroTipoSalon] = useState("");

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [horarioAElminar, setHorarioAEliminar] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id_periodo: "",
      id_docente: "",
      id_salon: "",
      id_materia: "",
      id_labor: "",
      dia_semana: "LUNES",
      hora_inicio: "",
      hora_fin: "",
    },
  });

  // Escuchar campos excluyentes
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedMateria = watch("id_materia");
  const watchedLabor = watch("id_labor");

  // Si selecciona Materia, vaciar y deshabilitar Labor
  useEffect(() => {
    if (watchedMateria) {
      setValue("id_labor", "");
    }
  }, [watchedMateria, setValue]);

  // Si selecciona Labor, vaciar y deshabilitar Materia
  useEffect(() => {
    if (watchedLabor) {
      setValue("id_materia", "");
    }
  }, [watchedLabor, setValue]);

  const cargarSoporte = async () => {
    try {
      const listaPeriodos = await servicioPeriodo.obtenerTodos();
      setPeriodos(listaPeriodos);
      if (listaPeriodos.length > 0) {
        const activo = listaPeriodos.find(p => p.activo) || listaPeriodos[0];
        setPeriodoSeleccionado(String(activo.id_periodo));
      }

      if (!esDocente) {
        const listaDocentes = await servicioDocente.obtenerTodos();
        setDocentes(listaDocentes.map(d => ({ valor: d.id_docente, texto: `${d.usuario.nombres} ${d.usuario.apellidos}` })));
      }

      const listaSalones = await servicioSalon.obtenerTodos();
      setSalones(listaSalones.map(s => ({ valor: s.id_salon, texto: `${s.nombre} (${s.tipo})` })));
      setTiposSalones(Array.from(new Set(listaSalones.map(s => s.tipo))));

      const listaMaterias = await servicioMateria.obtenerTodos();
      setMaterias(listaMaterias.map(m => ({ valor: m.id_materia, texto: `${m.codigo} - ${m.nombre}` })));

      const listaLabores = await servicioLabor.obtenerTodos();
      setLabores(listaLabores.map(l => ({ valor: l.id_labor, texto: l.nombre })));

    } catch (err) {
      toast.error("Error al cargar los datos de soporte.");
    }
  };

  const cargarHorarios = useCallback(async () => {
    if (!periodoSeleccionado) return;
    setCargando(true);
    setErrorCargar("");
    try {
      const datos = await servicioHorario.obtenerPorPeriodo(parseInt(periodoSeleccionado));
      const datosMapeados = datos.map((h) => ({
        ...h,
        actividad: h.materia ? h.materia.nombre : h.labor ? h.labor.nombre : "Sin actividad",
        docente_nombre: `${h.docente.usuario.nombres} ${h.docente.usuario.apellidos}`,
        salon_nombre: h.salon.nombre,
      }));
      setHorarios(datosMapeados);
    } catch (err) {
      setErrorCargar("Fallo al conectar con el motor de programación.");
      toast.error("Error al cargar la programación del periodo.");
    } finally {
      setCargando(false);
    }
  }, [periodoSeleccionado]);

  // Filtrado local dinámico y cruzado
  const horariosFiltrados = useMemo(() => {
    return horarios.filter(h => {
      if (esDocente) {
        if (h.docente?.usuario?.correo?.toLowerCase() !== usuario?.correo?.toLowerCase()) return false;
      } else {
        if (filtroDocente && String(h.id_docente) !== filtroDocente) return false;
      }
      if (filtroMateria && String(h.id_materia) !== filtroMateria) return false;
      if (filtroSalon && String(h.id_salon) !== filtroSalon) return false;
      if (filtroTipoSalon && h.salon?.tipo !== filtroTipoSalon) return false;
      return true;
    });
  }, [horarios, esDocente, usuario, filtroDocente, filtroMateria, filtroSalon, filtroTipoSalon]);

  const limpiarFiltros = () => {
    setFiltroDocente("");
    setFiltroMateria("");
    setFiltroSalon("");
    setFiltroTipoSalon("");
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("HORARIOS_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarSoporte();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  useEffect(() => {
    if (usuario && tienePermiso("HORARIOS_VER")) {
      cargarHorarios();
    }
  }, [cargarHorarios, usuario, tienePermiso]);

  if (cargandoSesion || !usuario || !tienePermiso("HORARIOS_VER")) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  const abrirModalCrear = () => {
    reset({
      id_periodo: periodoSeleccionado,
      id_docente: "",
      id_salon: "",
      id_materia: "",
      id_labor: "",
      dia_semana: "LUNES",
      hora_inicio: "",
      hora_fin: "",
    });
    setErrorAccion("");
    setModalCrearAbierto(true);
  };

  const alEnviarCrear = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      const payload = {
        id_periodo: parseInt(datos.id_periodo),
        id_docente: parseInt(datos.id_docente),
        id_salon: parseInt(datos.id_salon),
        id_materia: datos.id_materia ? parseInt(datos.id_materia) : null,
        id_labor: datos.id_labor ? parseInt(datos.id_labor) : null,
        dia_semana: datos.dia_semana,
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
      };

      await servicioHorario.crear(payload);
      toast.success("Horario programado exitosamente.");
      setModalCrearAbierto(false);
      cargarHorarios();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar programar el horario.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (horario) => {
    setHorarioAEliminar(horario);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioHorario.eliminar(horarioAElminar.id_horario);
      toast.success("Horario eliminado exitosamente.");
      setModalEliminarAbierto(false);
      cargarHorarios();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar eliminar el horario.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "dia_semana", cabecera: "Día" },
    { clave: "hora_inicio", cabecera: "Hora Inicio" },
    { clave: "hora_fin", cabecera: "Hora Fin" },
    { clave: "actividad", cabecera: "Asignatura / Labor" },
    { clave: "docente_nombre", cabecera: "Docente" },
    { clave: "salon_nombre", cabecera: "Salón" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        {/* Selector de Periodo */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <FiCalendar className="w-6 h-6 text-azul-principal" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-500 uppercase">Periodo Académico Activo</span>
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="mt-0.5 font-bold text-gray-800 bg-transparent focus:outline-none border-b-2 border-azul-principal cursor-pointer"
              >
                <option value="" disabled>Seleccione un periodo</option>
                {periodos.map((p) => (
                  <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <PermissionGate permission="HORARIOS_CREAR">
            <Boton
              variante="principal"
              alHacerClic={abrirModalCrear}
              icono={FiPlus}
              deshabilitado={!periodoSeleccionado}
            >
              Programar Horario
            </Boton>
          </PermissionGate>
        </div>

        {/* Panel de Filtros Avanzados (Solo para Administrativos / Secretario) */}
        {tienePermiso("HORARIOS_VER") && (
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4 select-none text-left">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Filtros de Búsqueda</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {!esDocente && (
                <Select
                  label="Docente"
                  nombre="filtroDocente"
                  opciones={docentes}
                  placeholder="Todos los Docentes"
                  value={filtroDocente}
                  onChange={(e) => setFiltroDocente(e.target.value)}
                />
              )}

              <Select
                label="Materia"
                nombre="filtroMateria"
                opciones={materias}
                placeholder="Todas las Materias"
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
              />

              <Select
                label="Salón / Ambiente"
                nombre="filtroSalon"
                opciones={salones}
                placeholder="Todos los Salones"
                value={filtroSalon}
                onChange={(e) => setFiltroSalon(e.target.value)}
              />

              <Select
                label="Tipo de Salón"
                nombre="filtroTipoSalon"
                opciones={tiposSalones.map(t => ({ valor: t, texto: t.replace("_", " ") }))}
                placeholder="Todos los Tipos"
                value={filtroTipoSalon}
                onChange={(e) => setFiltroTipoSalon(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end mt-2">
              <Boton
                variante="secundario"
                alHacerClic={limpiarFiltros}
              >
                Limpiar Filtros
              </Boton>
            </div>
          </div>
        )}

        {/* Listado / Calendario de Horarios */}
        <div className="flex flex-col gap-4">
          {cargando ? (
            <div className="flex justify-center items-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Spinner tamano="lg" color="principal" />
            </div>
          ) : (
            <HorarioSemanal
              horarios={horariosFiltrados}
              modo="completo"
              alEliminar={tienePermiso("HORARIOS_ELIMINAR") ? abrirModalEliminar : null}
              titulo="Grilla de Programación Académica"
              subtitulo="Muestra las materias y labores asignadas libres de colisiones en la sede Popayán"
            />
          )}
        </div>

        {/* Modal de Registro */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Programar Horario Académico"
        >
          <form
            onSubmit={handleSubmit(alEnviarCrear)}
            className="flex flex-col gap-4"
            noValidate
          >
            {errorAccion && (
              <Alerta
                tipo="error"
                titulo="Colisión o Error Detectado"
                mensaje={errorAccion}
              />
            )}

            <Select
              label="Docente"
              nombre="id_docente"
              opciones={docentes}
              registro={register("id_docente", { required: "El docente es obligatorio." })}
              error={errors.id_docente}
            />

            <Select
              label="Salón / Ambiente"
              nombre="id_salon"
              opciones={salones}
              registro={register("id_salon", { required: "El salón es obligatorio." })}
              error={errors.id_salon}
            />

            <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asignación de Actividad (Excluyente)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Materia"
                  nombre="id_materia"
                  opciones={materias}
                  placeholder="Ninguna"
                  registro={register("id_materia")}
                  deshabilitado={!!watchedLabor}
                />

                <Select
                  label="Labor Académica"
                  nombre="id_labor"
                  opciones={labores}
                  placeholder="Ninguna"
                  registro={register("id_labor")}
                  deshabilitado={!!watchedMateria}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Día de la Semana"
                nombre="dia_semana"
                opciones={[
                  { valor: "LUNES", texto: "Lunes" },
                  { valor: "MARTES", texto: "Martes" },
                  { valor: "MIERCOLES", texto: "Miércoles" },
                  { valor: "JUEVES", texto: "Jueves" },
                  { valor: "VIERNES", texto: "Viernes" },
                  { valor: "SABADO", texto: "Sábado" },
                ]}
                registro={register("dia_semana", { required: "El día es obligatorio." })}
                error={errors.dia_semana}
              />

              <InputText
                label="Hora Inicio"
                nombre="hora_inicio"
                placeholder="07:00"
                registro={register("hora_inicio", {
                  required: "La hora de inicio es obligatoria.",
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: "Formato HH:MM.",
                  },
                })}
                error={errors.hora_inicio}
              />

              <InputText
                label="Hora Fin"
                nombre="hora_fin"
                placeholder="09:00"
                registro={register("hora_fin", {
                  required: "La hora de finalización es obligatoria.",
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: "Formato HH:MM.",
                  },
                })}
                error={errors.hora_fin}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Boton
                variante="secundario"
                alHacerClic={() => setModalCrearAbierto(false)}
              >
                Cancelar
              </Boton>
              <Boton
                tipo="submit"
                variante="principal"
                cargando={cargandoAccion}
              >
                Programar Horario
              </Boton>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmación de Borrado */}
        <Modal
          abierto={modalEliminarAbierto}
          alCerrar={() => setModalEliminarAbierto(false)}
          titulo="Confirmar Eliminación"
        >
          <div className="flex flex-col gap-4">
            {errorAccion && (
              <Alerta
                tipo="error"
                titulo="Error al Borrar"
                mensaje={errorAccion}
              />
            )}

            <p className="text-gray-600 font-medium">
              ¿Está seguro de que desea eliminar este horario programado el día{" "}
              <strong className="text-gray-800">{horarioAElminar?.dia_semana}</strong> de{" "}
              <strong className="text-gray-800">{horarioAElminar?.hora_inicio}</strong> a{" "}
              <strong className="text-gray-800">{horarioAElminar?.hora_fin}</strong>?
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <Boton
                variante="secundario"
                alHacerClic={() => setModalEliminarAbierto(false)}
              >
                Cancelar
              </Boton>
              <Boton
                variante="peligro"
                alHacerClic={alConfirmarEliminar}
                cargando={cargandoAccion}
              >
                Confirmar y Eliminar
              </Boton>
            </div>
          </div>
        </Modal>
      </div>
    </LayoutPrincipal>
  );
}
