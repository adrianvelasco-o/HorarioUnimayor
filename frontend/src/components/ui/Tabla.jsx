import React, { useState } from "react";
import Skeleton from "./Skeleton";
import { FiChevronLeft, FiChevronRight, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

/**
 * Propósito: Componente reutilizable de Tabla institucional accesible y responsiva.
 * Caso de uso: UC-1 al UC-34 (Listados de todas las entidades del sistema)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la representación de datos)
 * Fecha: 2026-07-11
 */
export default function Tabla({
  columnas = [],
  datos = [],
  cargando = false,
  error = "",
  acciones = null, // Función para renderizar acciones por cada fila
  buscarPorPropiedad = "nombre",
  placeholderBusqueda = "Buscar registro...",
}) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [limitePorPagina, setLimitePorPagina] = useState(5);
  const [ordenarPor, setOrdenarPor] = useState({ clave: "", direccion: "asc" });

  // 1. Filtrado
  const datosFiltrados = datos.filter((registro) => {
    const valor = registro[buscarPorPropiedad];
    if (!valor) return true;
    return String(valor).toLowerCase().includes(terminoBusqueda.toLowerCase());
  });

  // 2. Ordenamiento
  const manejarOrdenamiento = (clave) => {
    let direccion = "asc";
    if (ordenarPor.clave === clave && ordenarPor.direccion === "asc") {
      direccion = "desc";
    }
    setOrdenarPor({ clave, direccion });
  };

  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!ordenarPor.clave) return 0;
    const valA = a[ordenarPor.clave];
    const valB = b[ordenarPor.clave];

    if (valA < valB) return ordenarPor.direccion === "asc" ? -1 : 1;
    if (valA > valB) return ordenarPor.direccion === "asc" ? 1 : -1;
    return 0;
  });

  // 3. Paginación
  const totalRegistros = datosOrdenados.length;
  const totalPaginas = Math.ceil(totalRegistros / limitePorPagina) || 1;
  const indiceInicial = (paginaActual - 1) * limitePorPagina;
  const datosPaginados = datosOrdenados.slice(indiceInicial, indiceInicial + limitePorPagina);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="tabla-buscador" className="sr-only">
            Buscar en la tabla
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiSearch className="w-5 h-5" aria-hidden="true" />
          </div>
          <input
            id="tabla-buscador"
            type="text"
            placeholder={placeholderBusqueda}
            value={terminoBusqueda}
            onChange={(e) => {
              setTerminoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-azul-principal focus:ring-1 focus:ring-azul-principal text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-gray-600">
          <span>Mostrar:</span>
          <select
            value={limitePorPagina}
            onChange={(e) => {
              setLimitePorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
            className="px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none text-gray-800"
          >
            <option value={5}>5 filas</option>
            <option value={10}>10 filas</option>
            <option value={20}>20 filas</option>
          </select>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="w-full border border-gray-200 rounded-lg shadow-sm bg-white overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider select-none border-b border-gray-200">
            <tr>
              {columnas.map((col, idxCol) => {
                const esOrdenable = col.ordenar !== false;
                const colClave = col.clave || col.cabecera || idxCol;
                const esColumnaOrdenada = col.clave && ordenarPor.clave === col.clave;
                const direccionOrden = esColumnaOrdenada
                  ? (ordenarPor.direccion === "asc" ? "ascending" : "descending")
                  : "none";

                return (
                  <th
                    key={colClave}
                    scope="col"
                    tabIndex={esOrdenable ? 0 : undefined}
                    aria-sort={esOrdenable ? direccionOrden : undefined}
                    onClick={esOrdenable && col.clave ? () => manejarOrdenamiento(col.clave) : undefined}
                    onKeyDown={
                      esOrdenable && col.clave
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              manejarOrdenamiento(col.clave);
                            }
                          }
                        : undefined
                    }
                    className={`px-6 py-3.5 focus-visible:ring-2 focus-visible:ring-hover focus-visible:outline-none rounded-sm ${
                      esOrdenable && col.clave ? "cursor-pointer hover:bg-gray-100 transition-colors select-none" : ""
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.cabecera}
                      {esOrdenable && esColumnaOrdenada && (
                        ordenarPor.direccion === "asc" ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                );
              })}
              {acciones && <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {error ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-6 py-8 text-center text-red-600 font-semibold select-none bg-red-50/50"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>⚠️ Error al procesar los datos</span>
                    <span className="text-xs text-red-500 font-medium">{error}</span>
                  </div>
                </td>
              </tr>
            ) : cargando ? (
              Array.from({ length: limitePorPagina }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={columnas.length + (acciones ? 1 : 0)} className="px-6 py-4">
                    <Skeleton variante="texto" />
                  </td>
                </tr>
              ))
            ) : datosPaginados.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500 font-semibold select-none"
                >
                  No se encontraron registros en el sistema.
                </td>
              </tr>
            ) : (
              datosPaginados.map((registro, idxFila) => (
                <tr key={idxFila} className="hover:bg-gray-50/50 transition-colors">
                  {columnas.map((col, idxCol) => {
                    const celdaKey = col.clave || col.cabecera || idxCol;
                    let contenidoCelda = "-";

                    if (col.render) {
                      contenidoCelda = col.render(registro);
                    } else if (col.selector) {
                      contenidoCelda = col.selector(registro);
                    } else if (col.clave && registro[col.clave] !== undefined) {
                      contenidoCelda = String(registro[col.clave]);
                    }

                    return (
                      <td key={celdaKey} className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                        {contenidoCelda}
                      </td>
                    );
                  })}
                  {acciones && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {acciones(registro)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!cargando && totalRegistros > 0 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1 select-none"
          aria-label="Paginación de registros"
        >
          <span className="text-xs font-semibold text-gray-500">
            Mostrando {indiceInicial + 1} a {Math.min(indiceInicial + limitePorPagina, totalRegistros)} de {totalRegistros} registros
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none"
              aria-label="Página anterior"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-1.5 border border-gray-300 rounded bg-white text-sm font-semibold text-gray-800">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none"
              aria-label="Página siguiente"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
