"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../context/ContextoAutenticacion";
import LayoutAutenticacion from "../../layouts/LayoutAutenticacion";
import InputText from "../../components/ui/InputText";
import Boton from "../../components/ui/Boton";
import Alerta from "../../components/ui/Alerta";
import { FiLock } from "react-icons/fi";

/**
 * Propósito: Pantalla de login institucional accesible
 * Caso de uso: UC-1 (Iniciar Sesión)
 * Requisitos relacionados: RF1, RF2, RF3
 * Escenarios QAW: QS-1 (Seguridad de acceso), QS-4 (Confiabilidad y retroalimentación)
 * Fecha: 2026-07-11
 */
export default function PaginaLogin() {
  const { iniciarSesion } = useAutenticacion();
  const enrutador = useRouter();
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      correo: "",
      contrasena: "",
    },
  });

  const alEnviarFormulario = async (datos) => {
    setCargando(true);
    setErrorLogin("");

    const resultado = await iniciarSesion(datos.correo, datos.contrasena);

    if (resultado.exitoso) {
      enrutador.push("/dashboard");
    } else {
      setErrorLogin(resultado.mensaje);
      setCargando(false);
    }
  };

  return (
    <LayoutAutenticacion>
      <form
        onSubmit={handleSubmit(alEnviarFormulario)}
        className="flex flex-col gap-5"
        noValidate
      >
        <div className="text-center mb-2 select-none">
          <h2 className="text-lg font-bold text-gray-800">
            Ingreso al Portal Académico
          </h2>
          <p className="text-xs text-gray-500 font-normal">
            Use sus credenciales institucionales de correo y contraseña
          </p>
        </div>

        {errorLogin && (
          <Alerta
            tipo="error"
            titulo="Acceso Denegado"
            mensaje={errorLogin}
          />
        )}

        <InputText
          label="Correo Electrónico Institucional"
          nombre="correo"
          tipo="email"
          placeholder="ejemplo@unimayor.edu.co"
          autoFocus={true}
          registro={register("correo", {
            required: "El correo electrónico es obligatorio.",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Ingrese un formato de correo institucional válido.",
            },
          })}
          error={errors.correo}
        />

        <InputText
          label="Contraseña"
          nombre="contrasena"
          tipo="password"
          placeholder="••••••••"
          registro={register("contrasena", {
            required: "La contraseña es obligatoria.",
          })}
          error={errors.contrasena}
        />

        <Boton
          tipo="submit"
          variante="principal"
          cargando={cargando}
          icono={FiLock}
          className="w-full mt-2"
        >
          Iniciar Sesión Seguro
        </Boton>
      </form>
    </LayoutAutenticacion>
  );
}
