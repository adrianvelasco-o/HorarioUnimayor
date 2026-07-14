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
import servicioMateria from "../../../services/servicioMateria";
import servicioPeriodo from "../../../services/servicioPeriodo";
import servicioHorario from "../../../services/servicioHorario";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import Spinner from "../../../components/ui/Spinner";

/**
 * Propósito: Vista de gestión de Materias / Asignaturas (CRUD)
 * Caso de uso: UC-30 al UC-34 (Gestión de Materias)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia relacional)
 * Fecha: 2026-07-11
 */
export default function PaginaMaterias() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();
  const esDocente = tienePermiso("MI_HORARIO_VER") && !tienePermiso("HORARIOS_CREAR");

  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigo: "",
      nombre: "",
      creditos: "",
      horas_semanales: "",
    },
  });

  const cargarMaterias = async () => {
    try {
      setErrorCargar("");
      if (esDocente) {
        // Obtener todos los periodos y luego los horarios de cada uno
        const periodos = await servicioPeriodo.obtenerTodos();
        const promesasHorarios = periodos.map(p => servicioHorario.obtenerPorPeriodo(p.id_periodo));
        const resultadosHorarios = await Promise.all(promesasHorarios);
        const todosHorarios = resultadosHorarios.flat();
        
        // Filtrar horarios por el correo del docente autenticado
        const miHorario = todosHorarios.filter(h => h.docente?.usuario?.correo?.toLowerCase() === usuario?.correo?.toLowerCase());
        
        // Extraer materias únicas asignadas
        const materiasUnicas = {};
        miHorario.forEach(h => {
          if (h.materia) {
            materiasUnicas[h.materia.id_materia] = h.materia;
          }
        });
        setMaterias(Object.values(materiasUnicas));
      } else {
        const datos = await servicioMateria.obtenerTodos();
        setMaterias(datos);
      }
    } catch (err) {
      setErrorCargar("Error al contactar con la API de materias.");
      toast.error("Error al cargar las materias y asignaturas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("MATERIAS_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarMaterias();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  if (cargandoSesion || !usuario || !tienePermiso("MATERIAS_VER")) {
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
      await servicioMateria.crear({
        codigo: datos.codigo,
        nombre: datos.nombre,
        creditos: parseInt(datos.creditos),
        horas_semanales: parseInt(datos.horas_semanales),
      });
      toast.success("Materia registrada exitosamente.");
      setModalCrearAbierto(false);
      cargarMaterias();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al registrar la materia (ej. código duplicado).";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (materia) => {
    setMateriaSeleccionada(materia);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioMateria.eliminar(materiaSeleccionada.id_materia);
      toast.success("Materia eliminada exitosamente del sistema.");
      setModalEliminarAbierto(false);
      cargarMaterias();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error de integridad relacional al borrar.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "codigo", cabecera: "Código Asignatura" },
    { clave: "nombre", cabecera: "Nombre de la Asignatura" },
    { clave: "creditos", cabecera: "Créditos" },
    { clave: "horas_semanales", cabecera: "Horas Semanales" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <Card
          titulo="Gestión de Asignaturas y Materias"
          subtitulo="Programe y audite el catálogo oficial de materias académicas"
          acciones={
            tienePermiso("MATERIAS_CREAR") ? (
              <Boton
                variante="principal"
                alHacerClic={abrirModalCrear}
                icono={FiPlus}
              >
                Registrar Materia
              </Boton>
            ) : undefined
          }
        >
          <Tabla
            columnas={columnas}
            datos={materias}
            cargando={cargando}
            error={errorCargar}
            buscarPorPropiedad="nombre"
            placeholderBusqueda="Buscar por asignatura (ej. Arquitectura)..."
            acciones={
              tienePermiso("MATERIAS_ELIMINAR") ? (materia) => (
                <Boton
                  variante="peligro"
                  alHacerClic={() => abrirModalEliminar(materia)}
                  icono={FiTrash2}
                  className="p-2"
                  aria-label={`Eliminar materia ${materia.nombre}`}
                >
                  Eliminar
                </Boton>
              ) : undefined
            }
          />
        </Card>

        {/* Modal de Registro */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Registrar Nueva Materia"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                label="Código Institucional"
                nombre="codigo"
                placeholder="Ej. ISOF401"
                registro={register("codigo", {
                  required: "El código es obligatorio.",
                })}
                error={errors.codigo}
              />

              <InputText
                label="Nombre de la Materia"
                nombre="nombre"
                placeholder="Ej. Arquitectura de Software"
                registro={register("nombre", {
                  required: "El nombre es obligatorio.",
                })}
                error={errors.nombre}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                label="Créditos Académicos"
                nombre="creditos"
                tipo="number"
                placeholder="Ej. 3"
                registro={register("creditos", {
                  required: "Los créditos son obligatorios.",
                  min: {
                    value: 1,
                    message: "Los créditos deben ser mayores a cero.",
                  },
                })}
                error={errors.creditos}
              />

              <InputText
                label="Horas Semanales"
                nombre="horas_semanales"
                tipo="number"
                placeholder="Ej. 4"
                registro={register("horas_semanales", {
                  required: "Las horas son obligatorias.",
                  min: {
                    value: 1,
                    message: "Las horas deben ser mayores a cero.",
                  },
                })}
                error={errors.horas_semanales}
              />
            </div>

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
                Registrar Materia
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
              ¿Está completamente seguro de que desea eliminar la materia{" "}
              <strong className="text-gray-800">
                {materiaSeleccionada?.nombre}
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
