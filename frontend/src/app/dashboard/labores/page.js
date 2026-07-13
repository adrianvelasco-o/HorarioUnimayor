"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";
import Card from "../../../components/ui/Card";
import Boton from "../../../components/ui/Boton";
import Tabla from "../../../components/ui/Tabla";
import Modal from "../../../components/ui/Modal";
import InputText from "../../../components/ui/InputText";
import Alerta from "../../../components/ui/Alerta";
import servicioLabor from "../../../services/servicioLabor";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import Spinner from "../../../components/ui/Spinner";

/**
 * Propósito: Vista de gestión de Labores Académicas (CRUD)
 * Caso de uso: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia relacional)
 * Fecha: 2026-07-11
 */
export default function PaginaLabores() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [labores, setLabores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [laborSeleccionada, setLaborSeleccionada] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      horas_semanales: "",
    },
  });

  const cargarLabores = async () => {
    try {
      setErrorCargar("");
      const datos = await servicioLabor.obtenerTodos();
      setLabores(datos);
    } catch (err) {
      setErrorCargar("Error al contactar con la API de labores.");
      toast.error("Error al cargar las labores académicas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("LABORES_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarLabores();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  if (cargandoSesion || !usuario || !tienePermiso("LABORES_VER")) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  const abrirModalCrear = () => {
    reset();
    setErrorAccion("");
    setModalCrearAbierto(true);
  };

  const alEnviarCrear = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioLabor.crear({
        ...datos,
        horas_semanales: parseInt(datos.horas_semanales),
      });
      toast.success("Labor académica registrada exitosamente.");
      setModalCrearAbierto(false);
      cargarLabores();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar registrar la labor.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (labor) => {
    setLaborSeleccionada(labor);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioLabor.eliminar(laborSeleccionada.id_labor);
      toast.success("Labor académica eliminada exitosamente.");
      setModalEliminarAbierto(false);
      cargarLabores();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error de integridad relacional al borrar.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "nombre", cabecera: "Nombre de la Labor" },
    { clave: "descripcion", cabecera: "Descripción" },
    { clave: "horas_semanales", cabecera: "Horas Semanales" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <Card
          titulo="Gestión de Labores Académicas"
          subtitulo="Programe y audite las labores de investigación, extensión y administración"
          acciones={
            <Boton
              variante="principal"
              alHacerClic={abrirModalCrear}
              icono={FiPlus}
            >
              Registrar Labor
            </Boton>
          }
        >
          <Tabla
            columnas={columnas}
            datos={labores}
            cargando={cargando}
            error={errorCargar}
            buscarPorPropiedad="nombre"
            placeholderBusqueda="Buscar por labor (ej. Investigación)..."
            acciones={(labor) => (
              <Boton
                variante="peligro"
                alHacerClic={() => abrirModalEliminar(labor)}
                icono={FiTrash2}
                className="p-2"
                aria-label={`Eliminar labor ${labor.nombre}`}
              >
                Eliminar
              </Boton>
            )}
          />
        </Card>

        {/* Modal de Registro */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Registrar Nueva Labor Académica"
        >
          <form
            onSubmit={handleSubmit(alEnviarCrear)}
            className="flex flex-col gap-4"
            noValidate
          >
            {errorAccion && (
              <Alerta
                tipo="error"
                titulo="Error de Validación"
                mensaje={errorAccion}
              />
            )}

            <InputText
              label="Nombre de la Labor"
              nombre="nombre"
              placeholder="Ej. Investigación de Grupo A"
              registro={register("nombre", {
                required: "El nombre es obligatorio.",
              })}
              error={errors.nombre}
            />

            <InputText
              label="Descripción (Opcional)"
              nombre="descripcion"
              placeholder="Ej. Investigación de proyectos institucionales de tecnología"
              registro={register("descripcion")}
              error={errors.descripcion}
            />

            <InputText
              label="Horas Semanales"
              nombre="horas_semanales"
              tipo="number"
              placeholder="Ej. 10"
              registro={register("horas_semanales", {
                required: "Las horas son obligatorias.",
                min: {
                  value: 1,
                  message: "Las horas deben ser mayores a cero.",
                },
              })}
              error={errors.horas_semanales}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Boton
                variante="secundario"
                alHacerClic={() => setModalCrearAbierto(false)}
              >
                Cancelar
              </Boton>
              <Boton
                tipo="submit"
                variante="principal"
                cargando={cargandoAccion}
              >
                Registrar Labor
              </Boton>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmación de Borrado */}
        <Modal
          abierto={modalEliminarAbierto}
          alCerrar={() => setModalEliminarAbierto(false)}
          titulo="Confirmar Eliminación"
        >
          <div className="flex flex-col gap-4">
            {errorAccion && (
              <Alerta
                tipo="error"
                titulo="Restricción de Integridad"
                mensaje={errorAccion}
              />
            )}

            <p className="text-gray-600 font-medium">
              ¿Está completamente seguro de que desea eliminar la labor académica{" "}
              <strong className="text-gray-800">
                {laborSeleccionada?.nombre}
              </strong>
              ? Esta acción no se puede deshacer de forma física en la base de datos.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <Boton
                variante="secundario"
                alHacerClic={() => setModalEliminarAbierto(false)}
              >
                Cancelar
              </Boton>
              <Boton
                variante="peligro"
                alHacerClic={alConfirmarEliminar}
                cargando={cargandoAccion}
              >
                Confirmar y Eliminar
              </Boton>
            </div>
          </div>
        </Modal>
      </div>
    </LayoutPrincipal>
  );
}
