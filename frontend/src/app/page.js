"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../context/ContextoAutenticacion";
import Spinner from "../components/ui/Spinner";

/**
 * Propósito: Redireccionamiento inicial de seguridad
 * Caso de uso: UC-1 al UC-34 (Control de accesos principal)
 * Requisitos relacionados: RF1, RF2
 * Escenarios QAW: QS-1 (Seguridad), QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */
export default function PaginaInicioRaiz() {
  const { usuario, cargando } = useAutenticacion();
  const enrutador = useRouter();

  useEffect(() => {
    if (!cargando) {
      if (usuario) {
        enrutador.replace("/dashboard");
      } else {
        enrutador.replace("/login");
      }
    }
  }, [usuario, cargando, enrutador]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-fondo">
      <div className="flex flex-col items-center gap-4">
        <Spinner tamano="lg" color="principal" />
        <p className="text-sm font-semibold text-gray-600 animate-pulse">
          Verificando credenciales de seguridad...
        </p>
      </div>
    </div>
  );
}
