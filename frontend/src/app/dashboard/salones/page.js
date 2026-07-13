"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LayoutPrincipal from "../../../layouts/LayoutPrincipal";
import Card from "../../../components/ui/Card";
import Boton from "../../../components/ui/Boton";
import Tabla from "../../../components/ui/Tabla";
import Modal from "../../../components/ui/Modal";
import InputText from "../../../components/ui/InputText";
import Select from "../../../components/ui/Select";
import Alerta from "../../../components/ui/Alerta";
import servicioSalon from "../../../services/servicioSalon";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import Spinner from "../../../components/ui/Spinner";

/**
 * Propósito: Vista de gestión de Salones y Ambientes (CRUD)
 * Caso de uso: UC-14 al UC-18 (Gestión de Salones)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia física)
 * Fecha: 2026-07-11
 */
export default function PaginaSalones() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
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
      tipo: "AULA",
      capacidad: "",
      ubicacion: "",
    },
  });

  const cargarSalones = async () => {
    try {
      setErrorCargar("");
      const datosReales = await servicioSalon.obtenerTodos();
      setSalones(datosReales);
    } catch (err) {
      setErrorCargar("Error al contactar con la API de salones.");
      toast.error("Error al cargar los ambientes y salones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("SALONES_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarSalones();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  if (cargandoSesion || !usuario || !tienePermiso("SALONES_VER")) {
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
      await servicioSalon.crear({
        ...datos,
        capacidad: parseInt(datos.capacidad),
      });
      toast.success("Salón / Ambiente registrado exitosamente.");
      setModalCrearAbierto(false);
      cargarSalones();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar registrar el salón.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (salon) => {
    setSalonSeleccionado(salon);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSalon.eliminar(salonSeleccionado.id_salon);
      toast.success("Registro de salón eliminado exitosamente.");
      setModalEliminarAbierto(false);
      cargarSalones();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error de integridad relacional al borrar.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "nombre", cabecera: "Nombre del Ambiente" },
    { clave: "tipo", cabecera: "Tipo" },
    { clave: "capacidad", cabecera: "Capacidad (Personas)" },
    { clave: "ubicacion", cabecera: "Ubicación Sede" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <Card
          titulo="Gestión de Salones y Ambientes"
          subtitulo="Programe y audite los salones físicos de la sede de Popayán"
          acciones={
            <Boton
              variante="principal"
              alHacerClic={abrirModalCrear}
              icono={FiPlus}
            >
              Registrar Salón
            </Boton>
          }
        >
          <Tabla
            columnas={columnas}
            datos={salones}
            cargando={cargando}
            error={errorCargar}
            buscarPorPropiedad="nombre"
            placeholderBusqueda="Buscar por salón (ej. Aula 301)..."
            acciones={(salon) => (
              <Boton
                variante="peligro"
                alHacerClic={() => abrirModalEliminar(salon)}
                icono={FiTrash2}
                className="p-2"
                aria-label={`Eliminar salón ${salon.nombre}`}
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
          titulo="Registrar Nuevo Salón / Ambiente"
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
              label="Nombre del Salón"
              nombre="nombre"
              placeholder="Ej. Aula 301 o Lab de Redes"
              registro={register("nombre", {
                required: "El nombre es obligatorio.",
              })}
              error={errors.nombre}
            />

            <Select
              label="Tipo de Ambiente"
              nombre="tipo"
              opciones={[
                { valor: "AULA", texto: "Aula / Salón de Clases" },
                { valor: "LABORATORIO", texto: "Laboratorio Académico" },
              ]}
              registro={register("tipo", {
                required: "El tipo es obligatorio.",
              })}
              error={errors.tipo}
            />

            <InputText
              label="Capacidad (Alumnos)"
              nombre="capacidad"
              tipo="number"
              placeholder="Ej. 30"
              registro={register("capacidad", {
                required: "La capacidad es obligatoria.",
                min: {
                  value: 1,
                  message: "La capacidad debe ser de al menos 1 persona.",
                },
              })}
              error={errors.capacidad}
            />

            <InputText
              label="Ubicación Sede"
              nombre="ubicacion"
              placeholder="Ej. Edificio A - Piso 3"
              registro={register("ubicacion")}
              error={errors.ubicacion}
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
                Registrar Salón
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
              ¿Está completamente seguro de que desea eliminar el salón{" "}
              <strong className="text-gray-800">
                {salonSeleccionado?.nombre}
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
