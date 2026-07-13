"use client";

import React from "react";
import Link from "next/link";
import { FiAlertOctagon, FiArrowLeft } from "react-icons/fi";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";

export default function PaginaAccesoDenegado() {
  return (
    <LayoutPrincipal>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none">
        <div className="p-4 bg-red-50 border border-red-200 rounded-full text-red-600 mb-6 animate-bounce">
          <FiAlertOctagon className="w-16 h-16" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3">
          Acceso Restringido
        </h1>
        
        <p className="text-gray-600 max-w-md mb-8 text-sm font-medium">
          Su rol institucional no posee los permisos suficientes para acceder a este módulo. Si cree que esto es un error, por favor contacte al administrador de seguridad.
        </p>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-azul-principal text-white font-semibold rounded-md shadow hover:bg-azul-principal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-hover focus:ring-offset-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </LayoutPrincipal>
  );
}
