"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutPrincipal from "../../../../layouts/LayoutPrincipal";
import Card from "../../../../components/ui/Card";
import Boton from "../../../../components/ui/Boton";
import Tabla from "../../../../components/ui/Tabla";
import Alerta from "../../../../components/ui/Alerta";
import Spinner from "../../../../components/ui/Spinner";
import Select from "../../../../components/ui/Select";
import { useAutenticacion } from "../../../../context/ContextoAutenticacion";
import servicioSeguridad from "../../../../services/servicioSeguridad";
import toast, { Toaster } from "react-hot-toast";
import { FiActivity, FiSearch, FiRefreshCw } from "react-icons/fi";

export default function PaginaAuditoriaAdmin() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCargar, setErrorCargar] = useState("");

  // Filtros
  const [idUsuario, setIdUsuario] = useState("");
  const [accion, setAccion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargandoLogs, setCargandoLogs] = useState(false);

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("AUDITORIA_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarDatos();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorCargar("");
      const [listaLogs, listaUsuarios] = await Promise.all([
        servicioSeguridad.obtenerAuditoria(),
        servicioSeguridad.obtenerUsuarios()
      ]);
      setLogs(listaLogs);
      setUsuarios(listaUsuarios);
    } catch (err) {
      setErrorCargar("Error al contactar con la API de auditoría.");
      toast.error("Error al cargar los logs de seguridad.");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = async (e) => {
    if (e) e.preventDefault();
    try {
      setCargandoLogs(true);
      const filtros = {};
      if (idUsuario) filtros.idUsuario = idUsuario;
      if (accion) filtros.accion = accion;
      if (fechaInicio) filtros.fechaInicio = fechaInicio;
      if (fechaFin) filtros.fechaFin = fechaFin;

      const listaFiltrada = await servicioSeguridad.obtenerAuditoria(filtros);
      setLogs(listaFiltrada);
      toast.success("Filtros aplicados correctamente.");
    } catch (err) {
      toast.error("Error al filtrar la bitácora.");
    } finally {
      setCargandoLogs(false);
    }
  };

  const limpiarFiltros = async () => {
    setIdUsuario("");
    setAccion("");
    setFechaInicio("");
    setFechaFin("");
    try {
      setCargandoLogs(true);
      const listaLogs = await servicioSeguridad.obtenerAuditoria();
      setLogs(listaLogs);
      toast.success("Bitácora restablecida.");
    } catch (err) {
      toast.error("Error al restablecer la bitácora.");
    } finally {
      setCargandoLogs(false);
    }
  };

  if (cargandoSesion || !usuario || !tienePermiso("AUDITORIA_VER") || cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  const columnasTabla = [
    {
      cabecera: "Fecha / Hora",
      selector: (l) => new Date(l.fecha).toLocaleString("es-ES"),
      ordenador: true
    },
    {
      cabecera: "Usuario",
      render: (l) => (
        <div className="flex flex-col select-none">
          <span className="font-semibold text-gray-800">
            {l.usuario ? `${l.usuario.nombres} ${l.usuario.apellidos}` : "Sistema / Anónimo"}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {l.usuario ? l.usuario.correo : "N/A"}
          </span>
        </div>
      )
    },
    {
      cabecera: "Acción",
      render: (l) => (
        <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 font-extrabold rounded text-[10px] uppercase">
          {l.accion}
        </span>
      )
    },
    {
      cabecera: "Descripción del Evento",
      selector: (l) => l.descripcion,
      render: (l) => (
        <span className="text-gray-600 block max-w-sm truncate select-none leading-relaxed" title={l.descripcion}>
          {l.descripcion}
        </span>
      )
    },
    {
      cabecera: "Dirección IP",
      selector: (l) => l.ip || "127.0.0.1",
      render: (l) => (
        <span className="font-mono text-gray-400 font-semibold">
          {l.ip || "127.0.0.1"}
        </span>
      )
    }
  ];

  const accionesCatalogo = [
    "INICIO_SESION",
    "MODIFICAR_USUARIO",
    "ACTIVAR_USUARIO",
    "DESACTIVAR_USUARIO",
    "ELIMINAR_USUARIO",
    "CAMBIO_CONTRASENA",
    "CREAR_ROL",
    "MODIFICAR_ROL",
    "ACTIVAR_ROL",
    "DESACTIVAR_ROL",
    "ELIMINAR_ROL",
    "ASIGNACION_PERMISOS"
  ];

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm select-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiActivity className="text-azul-principal" /> Bitácora de Auditoría Global
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Consulte y supervise los eventos de seguridad y cambios administrativos realizados en el sistema.
            </p>
          </div>

          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-600"
            title="Refrescar logs"
          >
            <FiRefreshCw className="w-4 h-4" /> Refrescar
          </button>
        </div>

        {errorCargar && <Alerta tipo="error" mensaje={errorCargar} />}

        {/* Panel de Filtros */}
        <Card titulo="Filtros de Búsqueda" subtitulo="Delimite los registros de la bitácora según criterios de control">
          <form onSubmit={aplicarFiltros} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Select
              id="idUsuario"
              label="Filtrar por Usuario"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
            >
              <option value="">Todos los Usuarios</option>
              {usuarios.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombres} {u.apellidos} ({u.correo})
                </option>
              ))}
            </Select>

            <Select
              id="accion"
              label="Filtrar por Acción"
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
            >
              <option value="">Todas las Acciones</option>
              {accionesCatalogo.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>

            <div className="flex flex-col gap-1">
              <label htmlFor="fechaInicio" className="text-xs font-bold text-gray-600">Desde</label>
              <input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                aria-describedby="fecha-inicio-ayuda"
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-azul-principal"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="fechaFin" className="text-xs font-bold text-gray-600">Hasta</label>
              <input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                aria-describedby="fecha-fin-ayuda"
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-azul-principal"
              />
            </div>

            <div className="flex gap-2">
              <Boton tipo="submit" variante="principal" cargando={cargandoLogs} className="flex-1">
                <FiSearch className="w-4 h-4 mr-2" /> Buscar
              </Boton>
              <Boton variante="secundario" alHacerClic={limpiarFiltros} className="flex-1">
                Limpiar
              </Boton>
            </div>
          </form>
        </Card>

        {/* Tabla de Logs */}
        <Card titulo="Logs Registrados" subtitulo="Bitácora de seguridad activa registrada en PostgreSQL">
          {cargandoLogs ? (
            <div className="flex justify-center items-center py-20">
              <Spinner tamano="md" color="principal" />
            </div>
          ) : (
            <Tabla columnas={columnasTabla} datos={logs} />
          )}
        </Card>
      </div>
    </LayoutPrincipal>
  );
}
