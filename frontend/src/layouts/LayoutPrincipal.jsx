"use client";

import React, { useState } from "react";
import Navbar from "../components/compartidos/Navbar";
import Sidebar from "../components/compartidos/Sidebar";
import Breadcrumb from "../components/compartidos/Breadcrumb";

/**
 * Propósito: Layout principal del panel administrativo con Sidebar y Navbar.
 * Caso de uso: UC-4 al UC-34 (Soporte Visual de Módulos Autenticados)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la maquetación interior)
 * Fecha: 2026-07-11
 */
export default function LayoutPrincipal({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const alAlternarSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  return (
    <div className="flex flex-col min-h-screen bg-fondo text-gray-800">
      {/* Cabecera Superior */}
      <Navbar alAlternarSidebar={alAlternarSidebar} />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Backdrop de fondo oscurecido para cerrar el menú lateral en dispositivos móviles (QS-4) */}
        {sidebarAbierto && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden transition-opacity duration-300"
            onClick={alAlternarSidebar}
            aria-hidden="true"
          />
        )}

        {/* Navegación Lateral (Sidebar) */}
        <Sidebar
          sidebarAbierto={sidebarAbierto}
          setSidebarAbierto={setSidebarAbierto}
        />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Migas de Pan (Breadcrumb) */}
          <Breadcrumb />

          {/* Renderizado de Vistas Hijas */}
          <section className="flex-1 mt-2">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
