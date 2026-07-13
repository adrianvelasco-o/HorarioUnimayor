"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAutenticacion } from "../../context/ContextoAutenticacion";
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiBookOpen, FiClock, FiLayers, FiMapPin, FiBriefcase, FiBell, FiSettings } from "react-icons/fi";
import PermissionGate from "./PermissionGate";

/**
 * Propósito: Navbar superior institucional responsivo y accesible que despliega el usuario y rol activo.
 * Caso de uso: UC-1 al UC-34 (Navegación General y Gestión de Sesión)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Cabecera corporativa y gestión de sesión)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
export default function Navbar({ alAlternarSidebar }) {
  const rutaActual = usePathname();
  const { usuario, cerrarSesion } = useAutenticacion();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const enlacesNavegacion = [
    { ruta: "/dashboard", texto: "Inicio", Icono: FiCalendar },
    { ruta: "/dashboard/docentes", texto: "Docentes", Icono: FiUser },
    { ruta: "/dashboard/materias", texto: "Materias", Icono: FiBookOpen },
    { ruta: "/dashboard/periodos", texto: "Períodos", Icono: FiClock },
    { ruta: "/dashboard/horarios", texto: "Horarios", Icono: FiLayers },
    { ruta: "/dashboard/salones", texto: "Salones", Icono: FiMapPin },
    { ruta: "/dashboard/labores", texto: "Labores", Icono: FiBriefcase },
  ];

  const esRutaActiva = (ruta) => {
    if (ruta === "/dashboard") {
      return rutaActual === "/dashboard";
    }
    return rutaActual.startsWith(ruta);
  };

  return (
    <header className="bg-azul-principal text-white shadow-md sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre Institucional */}
          <div className="flex items-center gap-3">
            <button
              onClick={alAlternarSidebar}
              className="p-2 rounded-md lg:hidden hover:bg-azul-secundario focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
              aria-label="Alternar menú lateral"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Logo HorarioUniMayor"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-lg tracking-tight hover:text-hover transition-colors duration-200">
                HorarioUniMayor
              </span>
            </div>
          </div>

          {/* Información del Usuario y Acciones del Sistema */}
          <div className="flex items-center gap-4">
            {usuario && (
              <div className="hidden sm:flex flex-col text-right select-none">
                <span className="text-sm font-bold text-white truncate max-w-[150px]">
                  {usuario.nombres}
                </span>
                <span className="text-xs font-semibold text-hover truncate max-w-[150px]">
                  {usuario.rol}
                </span>
              </div>
            )}

            {/* Notificaciones */}
            {/* <button
              className="p-2 rounded-full hover:bg-azul-secundario text-white hover:text-hover transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
              aria-label="Ver notificaciones del sistema"
            >
              <FiBell className="w-5 h-5" />
            </button> */}

            {/* Perfil */}
            <PermissionGate permission="MI_PERFIL_VER">
              <Link
                href="/dashboard/perfil"
                className="hidden sm:inline-flex p-2 rounded-full hover:bg-azul-secundario text-white hover:text-hover transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
                aria-label="Ir a mi perfil"
              >
                <FiUser className="w-5 h-5" />
              </Link>
            </PermissionGate>

            {/* Configuración */}
            <PermissionGate permission="PERMISOS_VER">
              <Link
                href="/dashboard/configuracion"
                className="hidden sm:inline-flex p-2 rounded-full hover:bg-azul-secundario text-white hover:text-hover transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
                aria-label="Ir a configuración del sistema"
              >
                <FiSettings className="w-5 h-5" />
              </Link>
            </PermissionGate>

            {/* Cerrar Sesión */}
            <button
              onClick={cerrarSesion}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:text-hover transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-hover"
              aria-label="Cerrar sesión institucional"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
