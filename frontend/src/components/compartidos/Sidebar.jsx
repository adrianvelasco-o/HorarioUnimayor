"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiUser, FiBookOpen, FiClock, FiLayers, FiMapPin, FiBriefcase, FiHome, FiSettings, FiLogOut, FiUsers, FiShield, FiLock, FiActivity } from "react-icons/fi";
import { useAutenticacion } from "../../context/ContextoAutenticacion";

/**
 * Propósito: Sidebar colapsable institucional con persistencia de estado local y soporte móvil responsivo.
 * Caso de uso: UC-1 al UC-34 (Navegación General Lateral)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Persistencia de preferencias de usabilidad y adaptabilidad móvil)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
export default function Sidebar({ sidebarAbierto, setSidebarAbierto }) {
  const rutaActual = usePathname();
  const [colapsado, setColapsado] = useState(false);
  const { usuario, cerrarSesion, tienePermiso } = useAutenticacion();

  // Cargar estado colapsado de localStorage en el montaje
  useEffect(() => {
    const estadoGuardado = localStorage.getItem("sidebar_colapsado");
    if (estadoGuardado === "true") {
      Promise.resolve().then(() => {
        setColapsado(true);
      });
    }
  }, []);

  const alternarColapso = () => {
    const nuevoEstado = !colapsado;
    setColapsado(nuevoEstado);
    localStorage.setItem("sidebar_colapsado", String(nuevoEstado));
  };

  const alHacerClicEnlace = () => {
    if (window.innerWidth < 1024) { // lg breakpoint is 1024px
      setSidebarAbierto(false);
    }
  };

  const esDocenteVista = tienePermiso("MI_HORARIO_VER") && !tienePermiso("HORARIOS_CREAR");
  const mostrarPerfilEnSidebar = tienePermiso("MI_PERFIL_VER") && !tienePermiso("USUARIOS_VER");

  const enlacesNavegacion = [
    { ruta: "/dashboard", texto: "Inicio", Icono: FiHome, permiso: null },
    { 
      ruta: "/dashboard/horarios", 
      texto: esDocenteVista ? "Mi Horario" : "Horarios", 
      Icono: FiLayers, 
      permiso: "HORARIOS_VER" 
    },
    { 
      ruta: "/dashboard/materias", 
      texto: esDocenteVista ? "Mis Materias" : "Materias", 
      Icono: FiBookOpen, 
      permiso: "MATERIAS_VER" 
    },
    { 
      ruta: "/dashboard/docentes", 
      texto: "Docentes", 
      Icono: FiUser, 
      permiso: "DOCENTES_VER",
      soloAdmin: true
    },
    { 
      ruta: "/dashboard/periodos", 
      texto: "Períodos", 
      Icono: FiClock, 
      permiso: "PERIODOS_VER",
      soloAdmin: true
    },
    { 
      ruta: "/dashboard/salones", 
      texto: "Salones", 
      Icono: FiMapPin, 
      permiso: "SALONES_VER",
      soloAdmin: true
    },
    { 
      ruta: "/dashboard/labores", 
      texto: "Labores", 
      Icono: FiBriefcase, 
      permiso: "LABORES_VER",
      soloAdmin: true
    },
    ...(mostrarPerfilEnSidebar ? [
      { 
        ruta: "/dashboard/perfil", 
        texto: "Mi Perfil", 
        Icono: FiUser, 
        permiso: "MI_PERFIL_VER" 
      }
    ] : [])
  ];

  const enlacesAdministracion = [
    { ruta: "/dashboard/seguridad/usuarios", texto: "Usuarios", Icono: FiUsers, permiso: "USUARIOS_VER" },
    { ruta: "/dashboard/seguridad/roles", texto: "Roles", Icono: FiShield, permiso: "ROLES_VER" },
    { ruta: "/dashboard/seguridad/permisos", texto: "Permisos", Icono: FiLock, permiso: "PERMISOS_VER" },
    { ruta: "/dashboard/seguridad/auditoria", texto: "Auditoría", Icono: FiActivity, permiso: "AUDITORIA_VER" },
  ];

  const esRutaActiva = (ruta) => {
    if (ruta === "/dashboard") {
      return rutaActual === "/dashboard";
    }
    return rutaActual.startsWith(ruta);
  };

  const enlacesFiltrados = enlacesNavegacion.filter(
    link => (!link.permiso || tienePermiso(link.permiso)) && (!link.soloAdmin || !esDocenteVista)
  );
  const adminFiltrados = enlacesAdministracion.filter(link => !link.permiso || tienePermiso(link.permiso));

  return (
    <aside
      className={`bg-azul-secundario text-white transition-all duration-300 flex flex-col border-r border-azul-principal select-none z-30 ${
        sidebarAbierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${colapsado ? "w-16" : "w-64"} fixed top-16 left-0 h-[calc(100vh-4rem)] lg:static lg:h-[calc(100vh-4rem)]`}
      aria-label="Menú lateral institucional"
    >
      {/* Botón de Colapso del Sidebar (Solo Desktop) */}
      <div className="hidden lg:flex justify-end p-2 border-b border-azul-principal">
        <button
          onClick={alternarColapso}
          className="p-1 rounded-md hover:bg-azul-principal text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
          aria-label={colapsado ? "Expandir menú lateral" : "Colapsar menú lateral"}
        >
          {colapsado ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Enlaces Principales */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto" aria-label="Enlaces del sistema">
        {enlacesFiltrados.map(({ ruta, texto, Icono }) => {
          const activo = esRutaActiva(ruta);
          return (
            <Link
              key={ruta}
              href={ruta}
              onClick={alHacerClicEnlace}
              aria-current={activo ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-hover ${
                activo
                  ? "text-hover bg-azul-principal shadow-sm"
                  : "text-white hover:text-hover hover:bg-azul-principal/30"
              }`}
            >
              <Icono className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!colapsado && <span className="truncate">{texto}</span>}
            </Link>
          );
        })}

        {/* Sección de Administración de Seguridad */}
        {adminFiltrados.length > 0 && (
          <div className="pt-4 border-t border-azul-principal/40 mt-4 space-y-1.5">
            {!colapsado ? (
              <div className="px-3 mb-2 text-xs font-bold tracking-wider text-gray-300 uppercase">
                Seguridad
              </div>
            ) : (
              <div className="border-b border-azul-principal/40 my-2" />
            )}

            {adminFiltrados.map(({ ruta, texto, Icono }) => {
              const activo = esRutaActiva(ruta);
              return (
                <Link
                  key={ruta}
                  href={ruta}
                  onClick={alHacerClicEnlace}
                  aria-current={activo ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-hover ${
                    activo
                      ? "text-hover bg-azul-principal shadow-sm"
                      : "text-white hover:text-hover hover:bg-azul-principal/30"
                  }`}
                >
                  <Icono className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!colapsado && <span className="truncate">{texto}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-azul-principal flex flex-col gap-2">
        {/* Acciones de Configuración y Salir (Solo en móvil para no duplicar en desktop) */}
        <Link
          href="/dashboard/configuracion"
          onClick={alHacerClicEnlace}
          className="flex lg:hidden items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-white hover:text-hover hover:bg-azul-principal/30 transition-all duration-200"
        >
          <FiSettings className="w-5 h-5 flex-shrink-0" />
          <span>Configuración</span>
        </Link>
        <button
          onClick={() => {
            cerrarSesion();
            alHacerClicEnlace();
          }}
          className="flex lg:hidden items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-white hover:text-hover hover:bg-azul-principal/30 transition-all duration-200 text-left w-full"
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          <span>Salir</span>
        </button>

        {!colapsado && (
          <div className="text-center text-xs text-gray-300 font-normal mt-2">
            <span>v1.0.0 © UniMayor</span>
          </div>
        )}
      </div>
    </aside>
  );
}
