"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";
import Card from "../../../components/ui/Card";
import Boton from "../../../components/ui/Boton";
import InputText from "../../../components/ui/InputText";
import Select from "../../../components/ui/Select";
import Alerta from "../../../components/ui/Alerta";
import Spinner from "../../../components/ui/Spinner";
import toast, { Toaster } from "react-hot-toast";
import { FiSliders, FiSave } from "react-icons/fi";

/**
 * Propósito: Vista de Configuración General del Portal
 * Caso de uso: UC-1 al UC-34 (Parámetros Institucionales y Preferencias)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la maquetación y control del sistema)
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */
export default function PaginaConfiguracion() {
  const { usuario, cargando } = useAutenticacion();
  const enrutador = useRouter();
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sede: "POPAYAN_CENTRO",
      limite_horas: "40",
      ip_servidor: "http://localhost:3000/api",
      modo_estricto: "HABILITADO",
    },
  });

  useEffect(() => {
    if (!cargando && !usuario) {
      enrutador.replace("/login");
    }
  }, [usuario, cargando, enrutador]);

  useEffect(() => {
    const configSede = localStorage.getItem("config_sede");
    const configHoras = localStorage.getItem("config_limite_horas");
    const configIp = localStorage.getItem("config_ip_servidor");
    const configModo = localStorage.getItem("config_modo_estricto");

    Promise.resolve().then(() => {
      if (configSede) setValue("sede", configSede);
      if (configHoras) setValue("limite_horas", configHoras);
      if (configIp) setValue("ip_servidor", configIp);
      if (configModo) setValue("modo_estricto", configModo);
    });
  }, [setValue]);

  const alEnviarConfiguracion = async (datos) => {
    setCargandoAccion(true);
    try {
      // Simular guardado de preferencias en localStorage del portal
      localStorage.setItem("config_sede", datos.sede);
      localStorage.setItem("config_limite_horas", datos.limite_horas);
      localStorage.setItem("config_ip_servidor", datos.ip_servidor);
      localStorage.setItem("config_modo_estricto", datos.modo_estricto);

      toast.success("Parámetros de configuración guardados correctamente.");
    } catch (err) {
      toast.error("Error al guardar la configuración.");
    } finally {
      setCargandoAccion(false);
    }
  };

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none">
        <Card
          titulo="Configuración del Sistema"
          subtitulo="Establezca las variables globales y parámetros operativos del portal"
        >
          <form
            onSubmit={handleSubmit(alEnviarConfiguracion)}
            className="flex flex-col gap-5 py-2"
            noValidate
          >
            <Select
              label="Sede Activa Principal"
              nombre="sede"
              opciones={[
                { valor: "POPAYAN_CENTRO", texto: "Sede Popayán - Centro" },
                { valor: "POPAYAN_NORTE", texto: "Sede Popayán - Norte" },
              ]}
              registro={register("sede", { required: "La sede es obligatoria." })}
              error={errors.sede}
            />

            <InputText
              label="Límite Horas Lectivas Semanales"
              nombre="limite_horas"
              tipo="number"
              placeholder="Ej. 40"
              registro={register("limite_horas", {
                required: "El límite de horas es obligatorio.",
                min: { value: 1, message: "El límite debe ser mayor a cero." },
              })}
              error={errors.limite_horas}
            />

            <InputText
              label="URL Base de API del Backend"
              nombre="ip_servidor"
              placeholder="Ej. http://localhost:3000/api"
              registro={register("ip_servidor", {
                required: "La IP del servidor es obligatoria.",
              })}
              error={errors.ip_servidor}
            />

            <Select
              label="Modo de Validación de Colisiones (Fachada)"
              nombre="modo_estricto"
              opciones={[
                { valor: "HABILITADO", texto: "Estricto (Rechazar traslapes de docente/salón)" },
                { valor: "INFORMATIVO", texto: "Informativo (Permitir con advertencia)" },
              ]}
              registro={register("modo_estricto", { required: "El modo es obligatorio." })}
              error={errors.modo_estricto}
            />

            <div className="flex justify-end gap-3 mt-4 border-t border-gray-150 pt-4">
              <Boton
                tipo="submit"
                variante="principal"
                cargando={cargandoAccion}
                icono={FiSave}
              >
                Guardar Configuración
              </Boton>
            </div>
          </form>
        </Card>
      </div>
    </LayoutPrincipal>
  );
}
