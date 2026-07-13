import { Inter } from "next/font/google";
import "./globals.css";

/* 
 * Propósito: Layout raíz de la aplicación con soporte para fuentes e idioma accesible
 * Caso de uso: UC-1 al UC-34 (Soporte General de Accesibilidad y visualización)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-4 (Consistencia en navegación e internacionalización)
 * Fecha: 2026-07-11
 */

import { ProveedorAutenticacion } from "../context/ContextoAutenticacion";

const fuenteInter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "HorarioUniMayor - Gestión de Programación Académica",
  description: "Sistema institucional de programación de horarios de la Institución Universitaria Colegio Mayor del Cauca.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fuenteInter.className} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-fondo text-gray-800">
        <ProveedorAutenticacion>
          {/* Enlace de accesibilidad para lectores de pantalla y navegación por teclado (WCAG 2.1 AA) */}
          <a href="#contenido-principal" className="saltar-contenido">
            Saltar al contenido principal
          </a>
          <main id="contenido-principal" className="flex-1 flex flex-col">
            {children}
          </main>
        </ProveedorAutenticacion>
      </body>
    </html>
  );
}
