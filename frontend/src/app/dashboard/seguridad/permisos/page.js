"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutPrincipal from "../../../../layouts/LayoutPrincipal";
import Card from "../../../../components/ui/Card";
import Boton from "../../../../components/ui/Boton";
import Spinner from "../../../../components/ui/Spinner";
import Alerta from "../../../../components/ui/Alerta";
import { useAutenticacion } from "../../../../context/ContextoAutenticacion";
import servicioSeguridad from "../../../../services/servicioSeguridad";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiLock, FiCheckSquare, FiSquare } from "react-icons/fi";

export default function PaginaPermisos() {
  const { usuario, cargando: cargandoSesion, tienePermiso } = useAutenticacion();
  const enrutador = useRouter();

  const [roles, setRoles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [permisosRol, setPermisosRol] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoPermisosRol, setCargandoPermisosRol] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cargandoSesion) {
      if (!usuario) {
        enrutador.replace("/login");
      } else if (!tienePermiso("PERMISOS_VER")) {
        enrutador.replace("/dashboard/acceso-denegado");
      } else {
        cargarDatosIniciales();
      }
    }
  }, [usuario, cargandoSesion, enrutador]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError("");
      const [listaRoles, listaPermisos] = await Promise.all([
        servicioSeguridad.obtenerRoles(),
        servicioSeguridad.obtenerPermisos()
      ]);
      
      setRoles(listaRoles.filter(r => r.activo));
      setPermisos(listaPermisos.filter(p => p.activo));

      if (listaRoles.length > 0) {
        const adminRol = listaRoles.find(r => r.nombre === "Administrador") || listaRoles[0];
        setRolSeleccionado(adminRol);
        await cargarPermisosDeRol(adminRol.id_rol);
      }
    } catch (err) {
      setError("Error al cargar la matriz de roles y permisos.");
      toast.error("Error al inicializar la pantalla.");
    } finally {
      setCargando(false);
    }
  };

  const cargarPermisosDeRol = async (idRol) => {
    try {
      setCargandoPermisosRol(true);
      const permisosAsociados = await servicioSeguridad.obtenerPermisosRol(idRol);
      setPermisosRol(permisosAsociados.map(p => p.id_permiso));
    } catch (err) {
      toast.error("Error al cargar los permisos del rol.");
    } finally {
      setCargandoPermisosRol(false);
    }
  };

  const alCambiarRol = async (rolObj) => {
    setRolSeleccionado(rolObj);
    await cargarPermisosDeRol(rolObj.id_rol);
  };

  const alternarPermiso = (idPermiso) => {
    if (permisosRol.includes(idPermiso)) {
      setPermisosRol(permisosRol.filter(id => id !== idPermiso));
    } else {
      setPermisosRol([...permisosRol, idPermiso]);
    }
  };

  const alternarGrupoPermisos = (moduloPermisos, activarTodos) => {
    const idsModulo = moduloPermisos.map(p => p.id_permiso);
    if (activarTodos) {
      // Agregar los que falten
      const nuevosPermisos = new Set([...permisosRol, ...idsModulo]);
      setPermisosRol(Array.from(nuevosPermisos));
    } else {
      // Quitar todos los del módulo
      setPermisosRol(permisosRol.filter(id => !idsModulo.includes(id)));
    }
  };

  const guardarMatriz = async () => {
    if (!rolSeleccionado) return;
    try {
      setGuardando(true);
      await servicioSeguridad.guardarPermisosRol(rolSeleccionado.id_rol, permisosRol);
      toast.success(`Matriz de permisos de '${rolSeleccionado.nombre}' actualizada exitosamente.`);
    } catch (err) {
      toast.error("Fallo al persistir la matriz de permisos.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoSesion || !usuario || !tienePermiso("PERMISOS_VER") || cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-fondo">
        <Spinner tamano="lg" color="principal" />
      </div>
    );
  }

  // Agrupar permisos por modulo
  const permisosAgrupados = {};
  permisos.forEach(p => {
    if (!permisosAgrupados[p.modulo]) {
      permisosAgrupados[p.modulo] = [];
    }
    permisosAgrupados[p.modulo].push(p);
  });

  return (
    <LayoutPrincipal>
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-1 select-none">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiLock className="text-azul-principal" /> Matriz de Asignación de Permisos
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Configure granularmente los accesos permitidos para cada rol institucional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Boton
              tipo="principal"
              alHacerClic={guardarMatriz}
              cargando={guardando}
              deshabilitado={!rolSeleccionado || cargandoPermisosRol}
            >
              <FiSave className="w-4 h-4 mr-2" /> Guardar Cambios
            </Boton>
          </div>
        </div>

        {error && <Alerta tipo="error" mensaje={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Listado de Roles */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm select-none">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Roles Institucionales
            </h2>
            <div className="flex flex-col gap-1.5">
              {roles.map(rol => {
                const activo = rolSeleccionado?.id_rol === rol.id_rol;
                return (
                  <button
                    key={rol.id_rol}
                    onClick={() => alCambiarRol(rol)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                      activo
                        ? "bg-azul-principal text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100/70"
                    }`}
                  >
                    {rol.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matriz de Permisos */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {cargandoPermisosRol ? (
              <div className="flex justify-center items-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Spinner tamano="md" color="principal" />
              </div>
            ) : rolSeleccionado ? (
              <div className="flex flex-col gap-6">
                {Object.entries(permisosAgrupados).map(([modulo, moduloPermisos]) => {
                  const todosActivos = moduloPermisos.every(p => permisosRol.includes(p.id_permiso));
                  return (
                    <Card
                      key={modulo}
                      titulo={`Módulo: ${modulo}`}
                      subtitulo={`Permisos disponibles para la gestión de ${modulo.toLowerCase()}`}
                      className="shadow-sm border border-gray-200"
                    >
                      {/* Controladores de Selección Rápida */}
                      <div className="flex justify-end gap-3 mb-4 select-none">
                        <button
                          type="button"
                          onClick={() => alternarGrupoPermisos(moduloPermisos, true)}
                          className="flex items-center gap-1 text-xs font-bold text-azul-principal hover:underline"
                        >
                          <FiCheckSquare className="w-3.5 h-3.5" /> Seleccionar Todo
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarGrupoPermisos(moduloPermisos, false)}
                          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:underline"
                        >
                          <FiSquare className="w-3.5 h-3.5" /> Limpiar Todo
                        </button>
                      </div>

                      {/* Cuadrícula de checkboxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {moduloPermisos.map(perm => {
                          const activo = permisosRol.includes(perm.id_permiso);
                          return (
                            <label
                              key={perm.id_permiso}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 select-none ${
                                activo
                                  ? "bg-azul-principal/5 border-azul-principal/30 shadow-sm"
                                  : "bg-white border-gray-200 hover:bg-gray-50/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={activo}
                                onChange={() => alternarPermiso(perm.id_permiso)}
                                aria-describedby="permiso-ayuda"
                                className="w-4 h-4 text-azul-principal border-gray-300 rounded focus:ring-azul-principal mt-0.5"
                              />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-gray-800">
                                  {perm.nombre}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                  {perm.codigo}
                                </span>
                                {perm.descripcion && (
                                  <span className="text-xs text-gray-500 font-normal mt-1 leading-relaxed">
                                    {perm.descripcion}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Seleccione un rol institucional para visualizar la matriz de permisos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
