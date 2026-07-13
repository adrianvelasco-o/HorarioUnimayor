"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiChevronRight } from "react-icons/fi";

import { useAutenticacion } from "../../context/ContextoAutenticacion";

/**
 * Propósito: Breadcrumb dinámico autogestionado que cumple estrictamente con el formato Inicio > Dashboard > Módulo > Página
 * Caso de uso: UC-1 al UC-34 (Navegación y Trazabilidad de Ubicación)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Usabilidad y consistencia en la navegación del usuario)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
export default function Breadcrumb() {
  const rutaActual = usePathname();
  const { tienePermiso } = useAutenticacion();

  // Mapear segmentos de URL a nombres institucionales en español
  const diccionarioRutas = {
    dashboard: "Dashboard",
    docentes: "Docentes",
    materias: "Materias",
    periodos: "Períodos",
    salones: "Salones",
    labores: "Labores",
    horarios: "Horarios",
    crear: "Crear",
    editar: "Editar",
    perfil: "Perfil",
    configuracion: "Configuración",
    seguridad: "Seguridad",
    usuarios: "Usuarios",
    roles: "Roles",
    permisos: "Permisos",
    auditoria: "Auditoría",
    "acceso-denegado": "Acceso Restringido",
  };

  const permisosSegmentos = {
    docentes: "DOCENTES_VER",
    materias: "MATERIAS_VER",
    periodos: "PERIODOS_VER",
    salones: "SALONES_VER",
    labores: "LABORES_VER",
    horarios: "HORARIOS_VER",
    usuarios: "USUARIOS_VER",
    roles: "ROLES_VER",
    permisos: "PERMISOS_VER",
    auditoria: "AUDITORIA_VER",
  };

  // Ignorar en la raíz pública o en el login
  if (rutaActual === "/" || rutaActual === "/login") {
    return null;
  }

  const segmentos = rutaActual.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex py-3 text-gray-600 bg-transparent select-none"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {/* Nodo Raíz Fijo: Inicio */}
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-azul-secundario transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
          >
            <FiHome className="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </Link>
        </li>

        {/* Nodos Dinámicos */}
        {segmentos.map((segmento, indice) => {
          const esUltimo = indice === segmentos.length - 1;
          const urlAcumulada = `/${segmentos.slice(0, indice + 1).join("/")}`;
          const nombreAmigable = diccionarioRutas[segmento] || segmento;

          const reqPermiso = permisosSegmentos[segmento];
          const tieneAcceso = !reqPermiso || tienePermiso(reqPermiso);

          if (!tieneAcceso) {
            return null;
          }

          return (
            <li key={urlAcumulada} className="inline-flex items-center">
              <FiChevronRight className="w-4 h-4 text-gray-400 mx-1" aria-hidden="true" />
              {esUltimo ? (
                <span
                  aria-current="page"
                  className="text-sm font-semibold text-azul-secundario"
                >
                  {nombreAmigable}
                </span>
              ) : (
                <Link
                  href={urlAcumulada}
                  className="text-sm font-medium text-gray-700 hover:text-azul-secundario transition-colors focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none"
                >
                  {nombreAmigable}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
