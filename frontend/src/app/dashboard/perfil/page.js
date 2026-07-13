"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";
import { FiUser, FiMail, FiShield, FiCalendar } from "react-icons/fi";

/**
 * Propósito: Vista de perfil del usuario logueado
 * Caso de uso: UC-1 al UC-34 (Navegación e Información de Cuenta)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la visualización de perfil)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
export default function PaginaPerfil() {
  const { usuario, cargando } = useAutenticacion();
  const enrutador = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      enrutador.replace("/login");
    }
  }, [usuario, cargando, enrutador]);

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  return (
    <LayoutPrincipal>
      <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none">
        <Card
          titulo="Mi Perfil Institucional"
          subtitulo="Consulte los detalles de su cuenta y privilegios asignados"
        >
          <div className="flex flex-col gap-6 py-4">
            {/* Avatar Escarapela */}
            <div className="flex items-center gap-4 border-b border-gray-150 pb-6">
              <div className="w-16 h-16 rounded-full bg-azul-principal flex items-center justify-center text-white text-xl font-bold border border-azul-secundario shadow-sm">
                {usuario.nombres?.charAt(0) || ""}
                {usuario.apellidos?.charAt(0) || ""}
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-bold text-gray-800">
                  {usuario.nombres} {usuario.apellidos || ""}
                </h2>
                <span className="text-xs font-semibold text-azul-secundario bg-azul-principal/10 px-2.5 py-1 rounded-full self-start">
                  Rol: {usuario.rol}
                </span>
              </div>
            </div>

            {/* Detalles de Información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <FiUser className="w-5 h-5 text-azul-principal" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Nombres Completos</span>
                  <span className="text-sm font-semibold text-gray-700">{usuario.nombres} {usuario.apellidos || ""}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <FiMail className="w-5 h-5 text-azul-principal" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Correo Institucional</span>
                  <span className="text-sm font-semibold text-gray-700">{usuario.correo}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <FiShield className="w-5 h-5 text-azul-principal" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Privilegios</span>
                  <span className="text-sm font-semibold text-gray-700">Acceso Completo a Lectura/Escritura</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                <FiCalendar className="w-5 h-5 text-azul-principal" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Estado Cuenta</span>
                  <span className="text-sm font-semibold text-green-600">Activo y Autorizado</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LayoutPrincipal>
  );
}
