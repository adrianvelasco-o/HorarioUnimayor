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
import servicioDocente from "../../../services/servicioDocente";
import toast, { Toaster } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAutenticacion } from "../../../context/ContextoAutenticacion";
import Spinner from "../../../components/ui/Spinner";
import PermissionGate from "../../../components/compartidos/PermissionGate";


/**
 * Propósito: Vista de gestión de Docentes (CRUD)
 * Caso de uso: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos relacionados: RF5, RF6
 * Escenarios QAW: QS-4 (Confiabilidad y consistencia transaccional 1:1)
 * Fecha: 2026-07-11
 */
export default function PaginaDocentes() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      contrasena: "",
      identificacion: "",
      telefono: "",
      horas_semanales_maximas: "",
      tipo_contrato: "TIEMPO_COMPLETO",
    },
  });

  const cargarDocentes = async () => {
    try {
      setErrorCargar("");
      const datos = await servicioDocente.obtenerTodos();
      // Formatear/Mapear para aplanar la estructura { usuario: { nombres, correo ... }, identificacion ... } para la tabla
      const datosAplanados = datos.map((d) => ({
        ...d,
        id: d.id_docente,
        nombre_completo: `${d.usuario.nombres} ${d.usuario.apellidos}`,
        correo: d.usuario.correo,
      }));
      setDocentes(datosAplanados);
    } catch (err) {
      setErrorCargar("Error al contactar con la API de docentes.");
      toast.error("Error al cargar el listado de docentes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("DOCENTES_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarDocentes();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  if (cargandoSesion || !usuario || !tienePermiso("DOCENTES_VER")) {
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
      await servicioDocente.crear({
        ...datos,
        horas_semanales_maximas: parseInt(datos.horas_semanales_maximas),
      });
      toast.success("Docente registrado exitosamente.");
      setModalCrearAbierto(false);
      cargarDocentes();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al intentar registrar el docente.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEliminar = (docente) => {
    setDocenteSeleccionado(docente);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioDocente.eliminar(docenteSeleccionado.id);
      toast.success("Registro de docente eliminado exitosamente.");
      setModalEliminarAbierto(false);
      cargarDocentes();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error de integridad relacional al borrar.";
      setErrorAccion(msg);
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnas = [
    { clave: "nombre_completo", cabecera: "Nombre Completo" },
    { clave: "correo", cabecera: "Correo" },
    { clave: "identificacion", cabecera: "Identificación" },
    { clave: "horas_semanales_maximas", cabecera: "Horas Semanales" },
    { clave: "tipo_contrato", cabecera: "Tipo de Contrato" },
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <Card
          titulo="Gestión de Personal Docente"
          subtitulo="Consulte y programe los docentes de la institución y sus relaciones contractuales"
          acciones={
            <PermissionGate permission="DOCENTES_CREAR">
              <Boton
                variante="principal"
                alHacerClic={abrirModalCrear}
                icono={FiPlus}
              >
                Registrar Docente
              </Boton>
            </PermissionGate>
          }
        >
          <Tabla
            columnas={columnas}
            datos={docentes}
            cargando={cargando}
            error={errorCargar}
            buscarPorPropiedad="nombre_completo"
            placeholderBusqueda="Buscar por nombre completo..."
            acciones={tienePermiso("DOCENTES_ELIMINAR") ? (docente) => (
              <Boton
                variante="peligro"
                alHacerClic={() => abrirModalEliminar(docente)}
                icono={FiTrash2}
                className="p-2"
                aria-label={`Eliminar docente ${docente.nombre_completo}`}
              >
                Eliminar
              </Boton>
            ) : undefined}
          />
        </Card>

        {/* Modal de Registro */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Registrar Nuevo Docente"
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
                label="Nombres"
                nombre="nombres"
                placeholder="Ej. Ginna"
                registro={register("nombres", {
                  required: "El nombre es obligatorio.",
                })}
                error={errors.nombres}
              />

              <InputText
                label="Apellidos"
                nombre="apellidos"
                placeholder="Ej. Erazo"
                registro={register("apellidos", {
                  required: "El apellido es obligatorio.",
                })}
                error={errors.apellidos}
              />
            </div>

            <InputText
              label="Correo Institucional"
              nombre="correo"
              tipo="email"
              placeholder="ejemplo@unimayor.edu.co"
              registro={register("correo", {
                required: "El correo es obligatorio.",
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                label="Identificación"
                nombre="identificacion"
                placeholder="Ej. 1061789"
                registro={register("identificacion", {
                  required: "La identificación es obligatoria.",
                })}
                error={errors.identificacion}
              />

              <InputText
                label="Teléfono"
                nombre="telefono"
                placeholder="Ej. 312345"
                registro={register("telefono")}
                error={errors.telefono}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                label="Horas Semanales Máximas"
                nombre="horas_semanales_maximas"
                tipo="number"
                placeholder="Ej. 40"
                registro={register("horas_semanales_maximas", {
                  required: "Las horas semanales son obligatorias.",
                  min: {
                    value: 1,
                    message: "Las horas deben ser mayores a cero.",
                  },
                })}
                error={errors.horas_semanales_maximas}
              />

              <Select
                label="Tipo de Contrato"
                nombre="tipo_contrato"
                opciones={[
                  { valor: "TIEMPO_COMPLETO", texto: "Tiempo Completo" },
                  { valor: "MEDIO_TIEMPO", texto: "Medio Tiempo" },
                  { valor: "CATEDRA", texto: "Cátedra" },
                ]}
                registro={register("tipo_contrato", {
                  required: "El tipo de contrato es obligatorio.",
                })}
                error={errors.tipo_contrato}
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
                Registrar Docente
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
              ¿Está completamente seguro de que desea eliminar al docente{" "}
              <strong className="text-gray-800">
                {docenteSeleccionado?.nombre_completo}
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
