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
import Select from "../../../../components/ui/Select";
import Alerta from "../../../../components/ui/Alerta";
import Spinner from "../../../../components/ui/Spinner";
import { useAutenticacion } from "../../../../context/ContextoAutenticacion";
import servicioSeguridad from "../../../../services/servicioSeguridad";
import toast, { Toaster } from "react-hot-toast";
import { FiUsers, FiEdit2, FiLock, FiActivity, FiUserMinus, FiEye, FiUserCheck, FiSearch, FiPlus } from "react-icons/fi";

export default function PaginaUsuariosAdmin() {
  const { usuario: usuarioSesion, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // Estados de objeto seleccionado
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [historialUsuario, setHistorialUsuario] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const {
    register: regCrear,
    handleSubmit: handleCrear,
    reset: resetCrear,
    watch: watchCrear,
    formState: { errors: errCrear }
  } = useForm({
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
      id_rol: "",
      activo: "true"
    }
  });

  const {
    register: regEditar,
    handleSubmit: handleEditar,
    reset: resetEditar,
    formState: { errors: errEditar }
  } = useForm();

  const {
    register: regClave,
    handleSubmit: handleClave,
    reset: resetClave,
    formState: { errors: errClave }
  } = useForm();

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuarioSesion) {
        enrutador.replace("/login");
      } else if (!tienePermiso("USUARIOS_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarDatos();
      }
    }
  }, [usuarioSesion, cargandoSesion, enrutador]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorCargar("");
      const [listaUsuarios, listaRoles] = await Promise.all([
        servicioSeguridad.obtenerUsuarios(),
        servicioSeguridad.obtenerRoles()
      ]);
      setUsuarios(listaUsuarios);
      setRoles(listaRoles.filter(r => r.activo));
    } catch (err) {
      setErrorCargar("Error al contactar con la API de seguridad.");
      toast.error("Error al cargar los usuarios del sistema.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    resetCrear({
      nombres: "",
      apellidos: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
      id_rol: "",
      activo: "true"
    });
    setErrorAccion("");
    setModalCrearAbierto(true);
  };

  const alEnviarCrear = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.crearUsuario({
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo,
        contrasena: datos.contrasena,
        id_rol: parseInt(datos.id_rol),
        activo: datos.activo === "true"
      });
      toast.success("Usuario registrado con éxito.");
      setModalCrearAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al registrar el usuario.");
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalEditar = (usr) => {
    setUsuarioSeleccionado(usr);
    resetEditar({
      nombres: usr.nombres,
      apellidos: usr.apellidos,
      id_rol: usr.id_rol
    });
    setErrorAccion("");
    setModalEditarAbierto(true);
  };

  const alEnviarEditar = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.actualizarUsuario(usuarioSeleccionado.id_usuario, {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        id_rol: parseInt(datos.id_rol)
      });
      toast.success("Usuario actualizado correctamente.");
      setModalEditarAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al actualizar el usuario.");
    } finally {
      setCargandoAccion(false);
    }
  };

  const alternarBloqueo = async (usr) => {
    // Evitar auto-bloqueo
    if (usr.id_usuario === usuarioSesion.idUsuario) {
      toast.error("Restricción de seguridad: No puede desactivarse a sí mismo.");
      return;
    }

    const nuevoEstado = !usr.activo;
    try {
      await servicioSeguridad.cambiarEstadoUsuario(usr.id_usuario, nuevoEstado);
      toast.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
      await cargarDatos();
    } catch (err) {
      toast.error("Fallo al actualizar el estado del usuario.");
    }
  };

  const abrirModalClave = (usr) => {
    setUsuarioSeleccionado(usr);
    resetClave({ contrasena: "" });
    setErrorAccion("");
    setModalClaveAbierto(true);
  };

  const alEnviarClave = async (datos) => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.cambiarContrasenaUsuario(usuarioSeleccionado.id_usuario, datos.contrasena);
      toast.success("Contraseña restablecida exitosamente.");
      setModalClaveAbierto(false);
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al restablecer la contraseña.");
    } finally {
      setCargandoAccion(false);
    }
  };

  const abrirModalHistorial = async (usr) => {
    setUsuarioSeleccionado(usr);
    setHistorialUsuario([]);
    setModalHistorialAbierto(true);
    try {
      setCargandoHistorial(true);
      const historial = await servicioSeguridad.obtenerHistorialUsuario(usr.id_usuario);
      setHistorialUsuario(historial);
    } catch (err) {
      toast.error("Error al cargar la bitácora del usuario.");
    } finally {
      setCargandoHistorial(false);
    }
  };

  const abrirModalEliminar = (usr) => {
    if (usr.id_usuario === usuarioSesion.idUsuario) {
      toast.error("Restricción de seguridad: No puede eliminarse a sí mismo.");
      return;
    }
    setUsuarioSeleccionado(usr);
    setErrorAccion("");
    setModalEliminarAbierto(true);
  };

  const alConfirmarEliminar = async () => {
    setCargandoAccion(true);
    setErrorAccion("");
    try {
      await servicioSeguridad.eliminarUsuario(usuarioSeleccionado.id_usuario);
      toast.success("Usuario eliminado exitosamente.");
      setModalEliminarAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorAccion(err.response?.data?.mensaje || "Error al eliminar el usuario.");
    } finally {
      setCargandoAccion(false);
    }
  };

  if (cargandoSesion || !usuarioSesion || !tienePermiso("USUARIOS_VER") || cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  // Filtrado local por búsqueda y selectores
  const usuariosFiltrados = usuarios.filter(usr => {
    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda = !query || (
      usr.nombres.toLowerCase().includes(query) ||
      usr.apellidos.toLowerCase().includes(query) ||
      usr.correo.toLowerCase().includes(query) ||
      (usr.rol?.nombre || "").toLowerCase().includes(query)
    );

    const coincideRol = !filtroRol || String(usr.id_rol) === filtroRol;
    const coincideEstado = !filtroEstado || String(usr.activo) === filtroEstado;

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const columnasTabla = [
    { cabecera: "Nombre Completo", selector: (u) => `${u.nombres} ${u.apellidos}` },
    { cabecera: "Correo Electrónico", selector: (u) => u.correo },
    {
      cabecera: "Rol",
      render: (u) => (
        <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-xs font-semibold rounded text-gray-700">
          {u.rol?.nombre || "Sin Rol"}
        </span>
      )
    },
    {
      cabecera: "Estado",
      render: (u) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {u.activo ? "Activo" : "Bloqueado"}
        </span>
      )
    },
    {
      cabecera: "Acciones",
      render: (u) => (
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={() => abrirModalEditar(u)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
            title="Editar usuario"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => abrirModalClave(u)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded border border-transparent hover:border-purple-200 transition-colors"
            title="Restablecer contraseña"
          >
            <FiLock className="w-4 h-4" />
          </button>
          <button
            onClick={() => alternarBloqueo(u)}
            className={`p-1.5 rounded border border-transparent transition-colors ${
              u.activo
                ? "text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                : "text-green-600 hover:bg-green-50 hover:border-green-200"
            }`}
            title={u.activo ? "Desactivar/Bloquear usuario" : "Activar usuario"}
          >
            {u.activo ? <FiUserMinus className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
          </button>
          <button
            onClick={() => abrirModalHistorial(u)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors"
            title="Ver logs de auditoría"
          >
            <FiActivity className="w-4 h-4" />
          </button>
          <button
            onClick={() => abrirModalEliminar(u)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
            title="Eliminar usuario"
          >
            <FiUserMinus className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm select-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiUsers className="text-azul-principal" /> Gestión de Usuarios y Accesos
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Administre cuentas institucionales, asigne roles, gestione bloqueos y supervise historiales de auditoría.
            </p>
          </div>
          {tienePermiso("USUARIOS_CREAR") && (
            <Boton
              variante="principal"
              alHacerClic={abrirModalCrear}
              icono={FiPlus}
            >
              Nuevo Usuario
            </Boton>
          )}
        </div>

        {errorCargar && <Alerta tipo="error" mensaje={errorCargar} />}

        <Card titulo="Usuarios Registrados" subtitulo="Listado completo de cuentas del sistema HorarioUniMayor">
          {/* Barra de Búsqueda y Filtros */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-end select-none">
            <div className="flex-1 w-full relative">
              <label htmlFor="busqueda" className="text-xs font-bold text-gray-600 mb-1 block">Buscar</label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-5 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                id="busqueda"
                type="text"
                placeholder="Buscar por nombres, correo o rol..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-1 focus:ring-azul-principal focus:border-azul-principal focus:outline-none"
              />
            </div>

            <div className="w-full md:w-48">
              <Select
                nombre="filtroRol"
                id="filtroRol"
                label="Rol"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="">Todos los Roles</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                ))}
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select
                nombre="filtroEstado"
                id="filtroEstado"
                label="Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="true">Activo</option>
                <option value="false">Bloqueado</option>
              </Select>
            </div>
          </div>

          <Tabla columnas={columnasTabla} datos={usuariosFiltrados} />
        </Card>

        {/* MODAL REGISTRAR USUARIO */}
        <Modal
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          titulo="Registrar Usuario"
        >
          <form onSubmit={handleCrear(alEnviarCrear)} className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <InputText
              nombre="nombres"
              id="nombres_crear"
              label="Nombres"
              placeholder="Ingrese los nombres"
              error={errCrear.nombres}
              registro={regCrear("nombres", { required: "El nombre es obligatorio." })}
            />

            <InputText
              nombre="apellidos"
              id="apellidos_crear"
              label="Apellidos"
              placeholder="Ingrese los apellidos"
              error={errCrear.apellidos}
              registro={regCrear("apellidos", { required: "El apellido es obligatorio." })}
            />

            <InputText
              nombre="correo"
              id="correo_crear"
              label="Correo institucional"
              type="email"
              placeholder="ejemplo@unimayor.edu.co"
              error={errCrear.correo}
              registro={regCrear("correo", { 
                required: "El correo es obligatorio.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingrese un correo institucional válido."
                }
              })}
            />

            <InputText
              nombre="contrasena"
              id="contrasena_crear"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errCrear.contrasena}
              registro={regCrear("contrasena", {
                required: "La contraseña es obligatoria.",
                minLength: { value: 6, message: "Mínimo 6 caracteres." }
              })}
            />

            <InputText
              nombre="confirmarContrasena"
              id="confirmarContrasena_crear"
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              error={errCrear.confirmarContrasena}
              registro={regCrear("confirmarContrasena", {
                required: "Debe confirmar la contraseña.",
                validate: valor => valor === watchCrear("contrasena") || "Las contraseñas no coinciden."
              })}
            />

            <Select
              nombre="id_rol"
              id="id_rol_crear"
              label="Rol"
              error={errCrear.id_rol}
              registro={regCrear("id_rol", { required: "Debe seleccionar un rol." })}
            >
              <option value="">Seleccione un Rol</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </Select>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-600 block">Estado</span>
              <div className="flex items-center gap-6 mt-1 select-none">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    {...regCrear("activo")}
                    className="w-4 h-4 text-azul-principal border-gray-300 focus:ring-azul-principal"
                  />
                  <span>Activo</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    {...regCrear("activo")}
                    className="w-4 h-4 text-azul-principal border-gray-300 focus:ring-azul-principal"
                  />
                  <span>Inactivo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Boton tipo="secundario" alHacerClic={() => setModalCrearAbierto(false)}>
                Cancelar
              </Boton>
              <Boton tipo="submit" variante="principal" cargando={cargandoAccion}>
                Guardar
              </Boton>
            </div>
          </form>
        </Modal>

        {/* MODAL EDITAR USUARIO */}
        <Modal
          abierto={modalEditarAbierto}
          alCerrar={() => setModalEditarAbierto(false)}
          titulo={`Editar Usuario: ${usuarioSeleccionado?.correo}`}
        >
          <form onSubmit={handleEditar(alEnviarEditar)} className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <InputText
              nombre="nombres"
              id="nombres"
              label="Nombres"
              placeholder="Ingrese los nombres"
              error={errEditar.nombres}
              registro={regEditar("nombres", { required: "El nombre es obligatorio." })}
            />

            <InputText
              nombre="apellidos"
              id="apellidos"
              label="Apellidos"
              placeholder="Ingrese los apellidos"
              error={errEditar.apellidos}
              registro={regEditar("apellidos", { required: "El apellido es obligatorio." })}
            />

            <Select
              nombre="id_rol"
              id="id_rol"
              label="Rol Institucional"
              error={errEditar.id_rol}
              registro={regEditar("id_rol", { required: "Debe seleccionar un rol." })}
            >
              <option value="">Seleccione un Rol</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </Select>

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

        {/* MODAL RESTABLECER CONTRASEÑA */}
        <Modal
          abierto={modalClaveAbierto}
          alCerrar={() => setModalClaveAbierto(false)}
          titulo={`Restablecer Contraseña: ${usuarioSeleccionado?.correo}`}
        >
          <form onSubmit={handleClave(alEnviarClave)} className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <p className="text-xs text-gray-500 mb-2">
              Suministre una nueva contraseña institucional de seguridad. Mínimo 6 caracteres.
            </p>

            <InputText
              nombre="contrasena"
              id="contrasena"
              label="Nueva Contraseña"
              type="password"
              placeholder="Contraseña segura"
              error={errClave.contrasena}
              registro={regClave("contrasena", {
                required: "La contraseña es requerida.",
                minLength: { value: 6, message: "Mínimo 6 caracteres." }
              })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Boton variante="secundario" alHacerClic={() => setModalClaveAbierto(false)}>
                Cancelar
              </Boton>
              <Boton tipo="submit" variante="principal" cargando={cargandoAccion}>
                Restablecer
              </Boton>
            </div>
          </form>
        </Modal>

        {/* MODAL ELIMINAR USUARIO */}
        <Modal
          abierto={modalEliminarAbierto}
          alCerrar={() => setModalEliminarAbierto(false)}
          titulo="Confirmar Eliminación"
        >
          <div className="flex flex-col gap-4">
            {errorAccion && <Alerta tipo="error" mensaje={errorAccion} />}

            <p className="text-sm font-medium text-gray-700">
              ¿Está absolutamente seguro de que desea eliminar la cuenta institucional de <span className="font-extrabold text-red-600">{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</span> ({usuarioSeleccionado?.correo})?
            </p>

            <p className="text-xs text-gray-400 leading-relaxed bg-red-50 border border-red-100 p-3 rounded">
              Advertencia: Esta acción es permanente y puede fallar si el usuario posee horarios u otros registros asociados en el sistema (por ejemplo, si es un docente programado).
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <Boton variante="secundario" alHacerClic={() => setModalEliminarAbierto(false)}>
                Cancelar
              </Boton>
              <Boton variante="peligro" alHacerClic={alConfirmarEliminar} cargando={cargandoAccion}>
                Eliminar Cuenta
              </Boton>
            </div>
          </div>
        </Modal>

        {/* MODAL LOGS DE AUDITORÍA DEL USUARIO */}
        <Modal
          abierto={modalHistorialAbierto}
          alCerrar={() => setModalHistorialAbierto(false)}
          titulo={`Bitácora de Auditoría: ${usuarioSeleccionado?.correo}`}
          tamano="large"
        >
          {cargandoHistorial ? (
            <div className="flex justify-center items-center py-12">
              <Spinner tamano="md" color="principal" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 select-none">
              {historialUsuario.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm font-medium">Este usuario no registra eventos de auditoría en la bitácora.</p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección IP</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-xs font-medium text-gray-600">
                      {historialUsuario.map(log => (
                        <tr key={log.id_historial} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(log.fecha).toLocaleString("es-ES")}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded text-[10px]">
                              {log.accion}
                            </span>
                          </td>
                          <td className="px-4 py-3 leading-relaxed max-w-xs truncate" title={log.descripcion}>{log.descripcion || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-400 font-mono">{log.ip || "127.0.0.1"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Boton variante="secundario" alHacerClic={() => setModalHistorialAbierto(false)}>
                  Cerrar Bitácora
                </Boton>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </LayoutPrincipal>
  );
}
