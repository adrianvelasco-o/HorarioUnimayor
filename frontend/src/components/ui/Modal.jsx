"use client";

import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

/**
 * Propósito: Componente Modal institucional, accesible y centrado.
 * Caso de uso: UC-1 al UC-34 (Formularios y confirmaciones emergentes)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en la interacción overlay)
 * Fecha: 2026-07-11
 */
export default function Modal({
  abierto = false,
  alCerrar = () => {},
  titulo = "",
  children,
}) {
  const refModal = useRef(null);
  const refElementoPrevio = useRef(null);

  // Manejar el cierre con la tecla Escape y atrapamiento de foco
  useEffect(() => {
    const selectorElementosEnfocables = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const manejarTeclado = (evento) => {
      if (evento.key === "Escape") {
        alCerrar();
        return;
      }

      if (evento.key === "Tab") {
        const contenedor = refModal.current;
        if (!contenedor) return;

        const elementosEnfocables = contenedor.querySelectorAll(selectorElementosEnfocables);
        if (elementosEnfocables.length === 0) {
          evento.preventDefault();
          return;
        }

        const primerElemento = elementosEnfocables[0];
        const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1];

        if (evento.shiftKey) {
          // Shift + Tab: si el foco está en el primer elemento, mover al último
          if (document.activeElement === primerElemento) {
            ultimoElemento.focus();
            evento.preventDefault();
          }
        } else {
          // Tab: si el foco está en el último elemento, mover al primero
          if (document.activeElement === ultimoElemento) {
            primerElemento.focus();
            evento.preventDefault();
          }
        }
      }
    };

    if (abierto) {
      // Guardar el elemento que tenía el foco antes de abrir el modal
      refElementoPrevio.current = document.activeElement;
      document.addEventListener("keydown", manejarTeclado);
      // Bloquear scroll de la página detrás
      document.body.style.overflow = "hidden";

      // Mover el foco al primer elemento interactivo dentro del modal
      setTimeout(() => {
        const contenedor = refModal.current;
        if (contenedor) {
          const elementosEnfocables = contenedor.querySelectorAll(selectorElementosEnfocables);
          if (elementosEnfocables.length > 0) {
            elementosEnfocables[0].focus();
          } else {
            contenedor.focus();
          }
        }
      }, 50);
    }

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = "unset";
      // Devolver el foco al elemento que lo tenía antes
      if (refElementoPrevio.current) {
        refElementoPrevio.current.focus();
      }
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      {/* Contenedor del Modal */}
      <div
        ref={refModal}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] focus:outline-none"
      >
        {/* Cabecera */}
        <header className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-4">
          <h2 id="modal-titulo" className="text-base font-bold text-gray-800 tracking-tight">
            {titulo}
          </h2>
          <button
            onClick={alCerrar}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-hover"
            aria-label="Cerrar modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </header>

        {/* Cuerpo */}
        <main className="p-6 overflow-y-auto flex-1 text-sm text-gray-700">
          {children}
        </main>
      </div>
    </div>
  );
}
