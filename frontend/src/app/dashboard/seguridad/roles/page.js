"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import LayoutPrincipal from "../../../../layouts/LayoutPrincipal";
import Card from "../../../../components/ui/Card";
import Boton from "../../../../components/ui/Boton";
import Tabla from "../../../../components/ui/Tabla";
import Modal from "../../../../components/ui/Modal";
import InputText from "../../../../components/ui/InputText";
import Alerta from "../../../../components/ui/Alerta";
import Spinner from "../../../../components/ui/Spinner";
import { useAutenticacion } from "../../../../context/ContextoAutenticacion";
import servicioSeguridad from "../../../../services/servicioSeguridad";
import toast, { Toaster } from "react-hot-toast";
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiPower } from "react-icons/fi";

export default function PaginaRolesAdmin() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // Estados seleccionados
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register: regCrear,
    handleSubmit: handleCrear,
    reset: resetCrear,
    formState: { errors: errCrear }
  } = useForm({
    defaultValues: { nombre: "", descripcion: "" }
  });

  const {
    register: regEditar,
    handleSubmit: handleEditar,
    reset: resetEditar,
    formState: { errors: errEditar }
  } = useForm();

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("ROLES_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarRoles();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  const cargarRoles = async () => {
    try {
      setCargando(true);
      setErrorCargar("");
      const listaRoles = await servicioSeguridad.obtenerRoles();
      setRoles(listaRoles);
    } catch (err) {
      setErrorCargar("Error al contactar con la API de roles.");
      toast.error("Error al cargar los roles.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    resetCrear({ nombre: "", descripcion: "" });
    setErrorAccion("");
    setModalCrearAbierto(true);
  };

  const alEnviarCrear = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.crearRol(datos);
      toast.success("Rol institucional creado correctamente.");
      setModalCrearAbierto(false);
      await cargarRoles();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al crear el rol.");
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEditar = (rol) => {
    setRolSeleccionado(rol);
    resetEditar({
      nombre: rol.nombre,
      descripcion: rol.descripcion
    });
    setErrorAccion("");
    setModalEditarAbierto(true);
  };

  const alEnviarEditar = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.actualizarRol(rolSeleccionado.id_rol, datos);
      toast.success("Rol actualizado con éxito.");
      setModalEditarAbierto(false);
      await cargarRoles();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al actualizar el rol.");
    } finally {
      setCargandoAccion(false);
    }
  };

  const alternarEstadoRol = async (rol) => {
    // Protección contra auto-desactivación del rol Administrador
    if (rol.nombre === "Administrador" && rol.activo) {
      toast.error("Restricción: No se puede desactivar el rol principal de Administrador.");
      return;
    }
    const nuevoEstado = !rol.activo;
    try {
      await servicioSeguridad.cambiarEstadoRol(rol.id_rol, nuevoEstado);
      toast.success(`Rol ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
      await cargarRoles();
    } catch (err) {
      toast.error("Fallo al actualizar el estado del rol.");
    }
  };

  const abrirModalEliminar = (rol) => {
    if (rol.nombre === "Administrador") {
      toast.error("Restricción crítica: No se puede eliminar el rol de Administrador.");
      return;
    }
    setRolSeleccionado(rol);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.eliminarRol(rolSeleccionado.id_rol);
      toast.success("Rol eliminado del sistema.");
      setModalEliminarAbierto(false);
      await cargarRoles();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "No se pudo eliminar el rol (probablemente contiene usuarios activos).");
    } finally {
      setCargandoAccion(false);
    }
  };

  const columnasTabla = React.useMemo(() => {
    const cols = [
      { cabecera: "ID", selector: (r) => r.id_rol },
      { cabecera: "Nombre del Rol", selector: (r) => r.nombre },
      { cabecera: "Descripción", selector: (r) => r.descripcion || "N/A" },
      {
        cabecera: "Estado",
        render: (r) => (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            r.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {r.activo ? "Activo" : "Inactivo"}
          </span>
        )
      }
    ];

    const tienePermisosAccion = tienePermiso("ROLES_EDITAR") || tienePermiso("ROLES_ELIMINAR");

    if (tienePermisosAccion) {
      cols.push({
        cabecera: "Acciones",
        render: (r) => (
          <div className="flex items-center gap-2 select-none">
            {tienePermiso("ROLES_EDITAR") && (
              <button
                onClick={() => abrirModalEditar(r)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
                title="Editar rol"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            {tienePermiso("ROLES_EDITAR") && (
              <button
                onClick={() => alternarEstadoRol(r)}
                className={`p-1.5 rounded border border-transparent transition-colors ${
                  r.activo
                    ? "text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                    : "text-green-600 hover:bg-green-50 hover:border-green-200"
                }`}
                title={r.activo ? "Desactivar rol" : "Activar rol"}
              >
                <FiPower className="w-4 h-4" />
              </button>
            )}
            {tienePermiso("ROLES_ELIMINAR") && (
              <button
                onClick={() => abrirModalEliminar(r)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                title="Eliminar rol"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      });
    }

    return cols;
  }, [tienePermiso, roles, abrirModalEditar, alternarEstadoRol, abrirModalEliminar]);

  if (cargandoSesion || !usuario || !tienePermiso("ROLES_VER") || cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm select-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiShield className="text-azul-principal" /> Roles del Sistema
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gestione perfiles institucionales para delimitar el acceso a los módulos académicos.
            </p>
          </div>

          {tienePermiso("ROLES_CREAR") && (
            <Boton tipo="principal" alHacerClic={abrirModalCrear}>
              <FiPlus className="w-4 h-4 mr-2" /> Crear Nuevo Rol
            </Boton>
          )}
        </div>

        {errorCargar && <Alerta tipo="error" mensaje={errorCargar} />}

        <Card titulo="Perfiles de Seguridad" subtitulo="Listado de roles habilitados en la base de datos">
          <Tabla columnas={columnasTabla} datos={roles} />
        </Card>

        {/* MODAL CREAR ROL */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Registrar Nuevo Rol"
        >
          <form onSubmit={handleCrear(alEnviarCrear)} className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <InputText
              nombre="nombre"
              id="nombre"
              label="Nombre del Rol"
              placeholder="Ej: Secretario de Facultad"
              error={errCrear.nombre}
              registro={regCrear("nombre", { required: "El nombre es obligatorio." })}
            />

            <InputText
              nombre="descripcion"
              id="descripcion"
              label="Descripción"
              placeholder="Describa el rol y su alcance institucional"
              error={errCrear.descripcion}
              registro={regCrear("descripcion")}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Boton variante="secundario" alHacerClic={() => setModalCrearAbierto(false)}>
                Cancelar
              </Boton>
              <Boton tipo="submit" variante="principal" cargando={cargandoAccion}>
                Crear Rol
              </Boton>
            </div>
          </form>
        </Modal>

        {/* MODAL EDITAR ROL */}
        <Modal
          abierto={modalEditarAbierto}
          alCerrar={() => setModalEditarAbierto(false)}
          titulo={`Editar Rol: ${rolSeleccionado?.nombre}`}
        >
          <form onSubmit={handleEditar(alEnviarEditar)} className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <InputText
              nombre="nombre"
              id="nombre"
              label="Nombre del Rol"
              placeholder="Ej: Docente Coordinador"
              error={errEditar.nombre}
              registro={regEditar("nombre", { required: "El nombre es obligatorio." })}
            />

            <InputText
              nombre="descripcion"
              id="descripcion"
              label="Descripción"
              placeholder="Alcance institucional del rol"
              error={errEditar.descripcion}
              registro={regEditar("descripcion")}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Boton variante="secundario" alHacerClic={() => setModalEditarAbierto(false)}>
                Cancelar
              </Boton>
              <Boton tipo="submit" variante="principal" cargando={cargandoAccion}>
                Guardar Cambios
              </Boton>
            </div>
          </form>
        </Modal>

        {/* MODAL ELIMINAR ROL */}
        <Modal
          abierto={modalEliminarAbierto}
          alCerrar={() => setModalEliminarAbierto(false)}
          titulo="Eliminar Rol Institucional"
        >
          <div className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <p className="text-sm font-medium text-gray-700">
              ¿Está absolutamente seguro de que desea eliminar permanentemente el rol <span className="font-extrabold text-red-600">{rolSeleccionado?.nombre}</span>?
            </p>

            <p className="text-xs text-gray-400 bg-red-50 p-3 rounded border border-red-100 leading-relaxed">
              Advertencia: Esta acción es destructiva y permanente. Si existen usuarios asignados a este rol en la base de datos, el sistema abortará la operación por integridad relacional.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <Boton variante="secundario" alHacerClic={() => setModalEliminarAbierto(false)}>
                Cancelar
              </Boton>
              <Boton variante="peligro" alHacerClic={alConfirmarEliminar} cargando={cargandoAccion}>
                Confirmar Eliminación
              </Boton>
            </div>
          </div>
        </Modal>
      </div>
    </LayoutPrincipal>
  );
}
