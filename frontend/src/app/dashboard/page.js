"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../context/ContextoAutenticacion";
import LayoutPrincipal from "../../layouts/LayoutPrincipal";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Alerta from "../../components/ui/Alerta";
import PermissionGate from "../../components/compartidos/PermissionGate";
import HorarioSemanal from "../../components/HorarioSemanal";
import servicioDashboard from "../../services/servicioDashboard";
import servicioPeriodo from "../../services/servicioPeriodo";
import servicioHorario from "../../services/servicioHorario";
import { FiUsers, FiBookOpen, FiClock, FiMapPin, FiLayers, FiArrowRight, FiBriefcase, FiUser, FiActivity } from "react-icons/fi";
import Link from "next/link";

export default function PaginaDashboard() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  // Estados Admin/Secretario
  const [metricas, setMetricas] = useState(null);
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");

  // Estados Docente
  const [docenteHorarios, setDocenteHorarios] = useState([]);
  const [docenteMaterias, setDocenteMaterias] = useState([]);
  const [docenteLabores, setDocenteLabores] = useState([]);
  const [periodoActivoDocente, setPeriodoActivoDocente] = useState(null);
  const [cargandoDocente, setCargandoDocente] = useState(false);
  const [totalHorasProg, setTotalHorasProg] = useState(0);

  const esAdministrativo = tienePermiso("HORARIOS_CREAR") || tienePermiso("ACCESOS_RAPIDOS_VER");
  const esDocente = tienePermiso("MI_HORARIO_VER") && !tienePermiso("HORARIOS_CREAR");

  useEffect(() => {
    if (!cargandoSesion && !usuario) {
      enrutador.replace("/login");
    }
  }, [usuario, cargandoSesion, enrutador]);

  // Cargar datos administrativos
  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setCargandoMetricas(true);
        const datos = await servicioDashboard.obtenerMetricasConsolidadas();
        setMetricas(datos);
      } catch (err) {
        setErrorCargar("No se pudo conectar con el servidor para consolidar la información del dashboard.");
      } finally {
        setCargandoMetricas(false);
      }
    };

    if (usuario && esAdministrativo) {
      cargarMetricas();
    }
  }, [usuario, esAdministrativo]);

  // Cargar datos del Docente
  useEffect(() => {
    const cargarDatosDocente = async () => {
      try {
        setCargandoDocente(true);
        setErrorCargar("");
        
        const periodos = await servicioPeriodo.obtenerTodos();
        const activo = periodos.find(p => p.activo) || periodos[0];
        
        if (activo) {
          setPeriodoActivoDocente(activo);
          const todosHorarios = await servicioHorario.obtenerPorPeriodo(activo.id_periodo);
          
          // Filtrar horarios propios del docente
          const miHorario = todosHorarios.filter(h => h.docente?.usuario?.correo?.toLowerCase() === usuario?.correo?.toLowerCase());
          setDocenteHorarios(miHorario);

          // Extraer asignaturas únicas
          const asignaturasUnicas = {};
          miHorario.forEach(h => {
            if (h.materia) {
              asignaturasUnicas[h.materia.id_materia] = h.materia;
            }
          });
          setDocenteMaterias(Object.values(asignaturasUnicas));

          // Extraer labores únicas
          const laboresUnicas = {};
          let horasTotales = 0;
          miHorario.forEach(h => {
            if (h.labor) {
              laboresUnicas[h.labor.id_labor] = h.labor;
              horasTotales += h.labor.horas_semanales;
            }
            if (h.materia) {
              horasTotales += h.materia.horas_semanales;
            }
          });
          setDocenteLabores(Object.values(laboresUnicas));
          setTotalHorasProg(horasTotales);
        }
      } catch (err) {
        setErrorCargar("Error al cargar la programación del docente.");
      } finally {
        setCargandoDocente(false);
      }
    };

    if (usuario && esDocente) {
      cargarDatosDocente();
    }
  }, [usuario, esDocente]);

  if (cargandoSesion || !usuario) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  // Tarjetas estadísticas adaptadas dinámicamente según permisos
  const tarjetasEstadisticas = [];
  if (metricas) {
    if (tienePermiso("DOCENTES_VER")) {
      tarjetasEstadisticas.push({
        titulo: "Docentes",
        valor: String(metricas.conteoDocentes),
        Icono: FiUsers,
        color: "text-blue-600 bg-blue-50 border-blue-200",
      });
    }
    if (tienePermiso("MATERIAS_CREAR")) { // Solo para Admin/Coordinadores
      tarjetasEstadisticas.push({
        titulo: "Materias",
        valor: String(metricas.conteoMaterias),
        Icono: FiBookOpen,
        color: "text-green-600 bg-green-50 border-green-200",
      });
    }
    if (tienePermiso("PERIODOS_VER")) {
      tarjetasEstadisticas.push({
        titulo: "Períodos",
        valor: String(metricas.conteoPeriodos),
        Icono: FiClock,
        color: "text-purple-600 bg-purple-50 border-purple-200",
      });
    }
    if (tienePermiso("SALONES_VER")) {
      tarjetasEstadisticas.push({
        titulo: "Salones",
        valor: String(metricas.conteoSalones),
        Icono: FiMapPin,
        color: "text-orange-600 bg-orange-50 border-orange-200",
      });
    }
    if (tienePermiso("HORARIOS_VER")) {
      tarjetasEstadisticas.push({
        titulo: "Horarios",
        valor: String(metricas.conteoHorarios),
        Icono: FiLayers,
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      });
    }
  }

  return (
    <LayoutPrincipal>
      <div className="flex flex-col gap-6">
        {/* Banner de Bienvenida */}
        <div className="bg-azul-principal text-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold tracking-tight">
              ¡Bienvenido al Portal Académico, {usuario.nombres}!
            </h1>
            <p className="text-sm font-medium opacity-90">
              Sistema unificado de programación y gestión horaria para la sede de Popayán.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-md text-xs font-semibold self-start md:self-auto border border-white/20">
            Rol: {usuario.rol}
          </div>
        </div>

        {errorCargar && (
          <Alerta
            tipo="error"
            titulo="Error de Conectividad"
            mensaje={errorCargar}
          />
        )}

        {/* ========================================================
            VISTA ADMINISTRATIVA (ADMINISTRADORES / SECRETARIOS)
           ======================================================== */}
        {esAdministrativo && (
          <>
            {cargandoMetricas ? (
              <div className="flex justify-center items-center py-8">
                <Spinner tamano="md" color="principal" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tarjetasEstadisticas.map(({ titulo, valor, Icono, color }) => (
                  <div
                    key={titulo}
                    className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                        {titulo}
                      </span>
                      <span className="text-2xl font-bold text-gray-800">
                        {valor}
                      </span>
                    </div>
                    <div className={`p-3 rounded-full border ${color} flex-shrink-0`}>
                      <Icono className="w-6 h-6" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Accesos Rápidos según permisos */}
              <Card
                titulo="Accesos Rápidos del Sistema"
                subtitulo="Gestión directa de entidades institucionales"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PermissionGate permission="HORARIOS_VER">
                    <Link
                      href="/dashboard/horarios"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-azul-principal/5 transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <FiLayers className="w-5 h-5 text-azul-principal" />
                        <span className="text-sm font-bold text-gray-700">Programación de Horarios</span>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </PermissionGate>

                  <PermissionGate permission="DOCENTES_VER">
                    <Link
                      href="/dashboard/docentes"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-azul-principal/5 transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <FiUsers className="w-5 h-5 text-azul-principal" />
                        <span className="text-sm font-bold text-gray-700">Gestión de Docentes</span>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </PermissionGate>

                  <PermissionGate permission="MATERIAS_CREAR">
                    <Link
                      href="/dashboard/materias"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-azul-principal/5 transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <FiBookOpen className="w-5 h-5 text-azul-principal" />
                        <span className="text-sm font-bold text-gray-700">Gestión de Materias</span>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </PermissionGate>

                  <PermissionGate permission="SALONES_VER">
                    <Link
                      href="/dashboard/salones"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-azul-principal/5 transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <FiMapPin className="w-5 h-5 text-azul-principal" />
                        <span className="text-sm font-bold text-gray-700">Salones y Ambientes</span>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </PermissionGate>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ========================================================
            VISTA DOCENTE (DOCENTES CON ACCESO EXCLUSIVO A SUS DATOS)
           ======================================================== */}
        {esDocente && (
          <>
            {cargandoDocente ? (
              <div className="flex justify-center items-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Spinner tamano="md" color="principal" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mi Perfil / Resumen Carga Horaria */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <Card
                    titulo="Resumen de Carga Horaria"
                    subtitulo={`Periodo Activo: ${periodoActivoDocente ? periodoActivoDocente.nombre : "Cargando..."}`}
                  >
                    <div className="flex flex-col gap-4 py-2 select-none">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Horas Programadas:</span>
                        <span className="text-base font-extrabold text-azul-principal">{totalHorasProg} hrs</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-azul-principal h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (totalHorasProg / 40) * 100)}%` }}
                        />
                      </div>
                      
                      <div className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                        Nota: Las horas semanales acumuladas corresponden a la sumatoria de sus materias y labores académicas asignadas en este ciclo lectivo.
                      </div>
                    </div>
                  </Card>

                  <Card titulo="Mis Asignaturas" subtitulo="Materias asignadas a mi cargo este periodo">
                    <div className="flex flex-col gap-3 select-none">
                      {docenteMaterias.length === 0 ? (
                        <p className="text-xs text-gray-500 font-medium text-center py-4">No tiene materias programadas en este ciclo.</p>
                      ) : (
                        docenteMaterias.map(mat => (
                          <div key={mat.id_materia} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-800">{mat.nombre}</span>
                              <span className="text-[10px] text-gray-400 font-medium">Código: {mat.codigo}</span>
                            </div>
                            <span className="text-xs font-extrabold text-azul-secundario bg-azul-principal/10 px-2 py-0.5 rounded">
                              {mat.horas_semanales} hrs
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card titulo="Mis Labores Académicas" subtitulo="Actividades no lectivas asignadas">
                    <div className="flex flex-col gap-3 select-none">
                      {docenteLabores.length === 0 ? (
                        <p className="text-xs text-gray-500 font-medium text-center py-4">No tiene labores asignadas en este ciclo.</p>
                      ) : (
                        docenteLabores.map(lab => (
                          <div key={lab.id_labor} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-800">{lab.nombre}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{lab.descripcion || "Sin descripción"}</span>
                            </div>
                            <span className="text-xs font-extrabold text-azul-secundario bg-azul-principal/10 px-2 py-0.5 rounded">
                              {lab.horas_semanales} hrs
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Horario Semanal Interactivo */}
                <div className="lg:col-span-2">
                  <HorarioSemanal horarios={docenteHorarios} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LayoutPrincipal>
  );
}
