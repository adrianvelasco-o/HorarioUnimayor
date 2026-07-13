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
import servicioPeriodo from "../../../services/servicioPeriodo";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2, FiCalendar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import Spinner from "../../../components/ui/Spinner";

/**
 * Propósito: Vista de gestión de Periodos Académicos (CRUD)
 * Caso de uso: UC-9 al UC-13 (Gestión de Periodos)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y retroalimentación de estado)
 * Fecha: 2026-07-11
 */
export default function PaginaPeriodos() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
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
      fecha_inicio: "",
      fecha_fin: "",
    },
  });

  const cargarPeriodos = async () => {
    try {
      setErrorCargar("");
      const datos = await servicioPeriodo.obtenerTodos();
      // Formatear fechas para mejor visualización
      const datosFormateados = datos.map((p) => ({
        ...p,
        fecha_inicio_formateada: new Date(p.fecha_inicio).toLocaleDateString("es-ES"),
        fecha_fin_formateada: new Date(p.fecha_fin).toLocaleDateString("es-ES"),
      }));
      setPeriodos(datosFormateados);
    } catch (err) {
      setErrorCargar("Fallo al contactar con la API de periodos.");
      toast.error("Error al cargar los periodos académicos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("PERIODOS_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarPeriodos();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  if (cargandoSesion || !usuario || !tienePermiso("PERIODOS_VER")) {
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
      await servicioPeriodo.crear({
        nombre: datos.nombre,
        fecha_inicio: new Date(datos.fecha_inicio).toISOString(),
        fecha_fin: new Date(datos.fecha_fin).toISOString(),
      });
      toast.success("Periodo académico creado exitosamente.");
      setModalCrearAbierto(false);
      cargarPeriodos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar registrar el periodo.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (periodo) => {
    setPeriodoSeleccionado(periodo);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioPeriodo.eliminar(periodoSeleccionado.id_periodo);
      toast.success("Periodo académico eliminado exitosamente.");
      setModalEliminarAbierto(false);
      cargarPeriodos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error de integridad relacional al borrar.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "nombre", cabecera: "Nombre del Ciclo" },
    { clave: "fecha_inicio_formateada", cabecera: "Fecha de Inicio" },
    { clave: "fecha_fin_formateada", cabecera: "Fecha de Finalización" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <Card
          titulo="Gestión de Periodos Académicos"
          subtitulo="Programe y audite los periodos de clases institucionales"
          acciones={
            <Boton
              variante="principal"
              alHacerClic={abrirModalCrear}
              icono={FiPlus}
            >
              Registrar Periodo
            </Boton>
          }
        >
          <Tabla
            columnas={columnas}
            datos={periodos}
            cargando={cargando}
            error={errorCargar}
            buscarPorPropiedad="nombre"
            placeholderBusqueda="Buscar por nombre (ej. 2026-1)..."
            acciones={(periodo) => (
              <Boton
                variante="peligro"
                alHacerClic={() => abrirModalEliminar(periodo)}
                icono={FiTrash2}
                className="p-2"
                aria-label={`Eliminar periodo ${periodo.nombre}`}
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
          titulo="Registrar Nuevo Periodo Académico"
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
              label="Nombre del Periodo"
              nombre="nombre"
              placeholder="Ej. 2026-1"
              registro={register("nombre", {
                required: "El nombre es obligatorio.",
                maxLength: {
                  value: 50,
                  message: "El nombre no puede exceder los 50 caracteres.",
                },
              })}
              error={errors.nombre}
            />

            <InputText
              label="Fecha de Inicio"
              nombre="fecha_inicio"
              tipo="date"
              registro={register("fecha_inicio", {
                required: "La fecha de inicio es obligatoria.",
              })}
              error={errors.fecha_inicio}
            />

            <InputText
              label="Fecha de Finalización"
              nombre="fecha_fin"
              tipo="date"
              registro={register("fecha_fin", {
                required: "La fecha de finalización es obligatoria.",
              })}
              error={errors.fecha_fin}
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
                Guardar Periodo
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
              ¿Está completamente seguro de que desea eliminar el periodo académico{" "}
              <strong className="text-gray-800">
                {periodoSeleccionado?.nombre}
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
