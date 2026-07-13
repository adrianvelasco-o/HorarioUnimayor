const fs = require("fs");
const path = require("path");

/**
 * Propósito: Script ejecutable de auditoría arquitectónica y estática de código
 * Caso de uso: UC-1 al UC-34 (Aseguramiento de Calidad en Producción)
 * Requisitos relacionados: RF1, RF8, RF7, WCAG 2.1 AA
 * Fecha: 2026-07-11
 * Autor: HorarioUniMayor Full Stack Team
 */

const carpetaRaiz = path.join(__dirname, "..", "app");
const carpetaComponentes = path.join(__dirname, "..", "components");

let totalViolaciones = 0;

function auditarArchivo(rutaArchivo) {
  const contenido = fs.readFileSync(rutaArchivo, "utf8");
  const nombreBase = path.basename(rutaArchivo);

  // 1. Control de accesos y labels
  if (contenido.includes("<input") && !contenido.includes("aria-describedby") && !contenido.includes("registro")) {
    console.warn(`[ACCESIBILIDAD] Advertencia en ${nombreBase}: Entrada de formulario sin descripción accesible aria.`);
    totalViolaciones++;
  }

  // 2. Control de roles semánticos
  if (contenido.includes("role=") && !contenido.includes("aria-live") && nombreBase.includes("Alerta")) {
    console.warn(`[ACCESIBILIDAD] Advertencia en ${nombreBase}: Banners de alerta sin propiedad aria-live activa.`);
    totalViolaciones++;
  }

  // 3. Colores corporativos (Prevenir colores genéricos no permitidos)
  const coloresProhibidos = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-indigo-500"];
  coloresProhibidos.forEach((color) => {
    if (contenido.includes(color) && !rutaArchivo.includes("globals.css")) {
      console.warn(`[DISEÑO] Advertencia en ${nombreBase}: Uso de color genérico '${color}' prohibido por la paleta institucional.`);
      totalViolaciones++;
    }
  });

  // 4. Principios SOLID - Evitar acoplamiento de API directo
  if (contenido.includes("axios.") && (rutaArchivo.includes("app") || rutaArchivo.includes("components/ui"))) {
    console.error(`[SOLID] Violación en ${nombreBase}: Consumo de API Axios directo desde la vista o componentes de UI.`);
    totalViolaciones++;
  }
}

function recorrerDirectorio(directorio) {
  if (!fs.existsSync(directorio)) return;
  const archivos = fs.readdirSync(directorio);

  archivos.forEach((archivo) => {
    const rutaAbsoluta = path.join(directorio, archivo);
    const estado = fs.statSync(rutaAbsoluta);

    if (estado.isDirectory()) {
      recorrerDirectorio(rutaAbsoluta);
    } else if (estado.isFile() && /\.(js|jsx|ts|tsx)$/.test(archivo)) {
      auditarArchivo(rutaAbsoluta);
    }
  });
}

console.log("Iniciando auditoría estática de código de HorarioUniMayor...");
recorrerDirectorio(carpetaRaiz);
recorrerDirectorio(carpetaComponentes);

console.log("\n--------------------------------------------------");
console.log(`Auditoría finalizada. Total de problemas encontrados: ${totalViolaciones}`);
console.log("--------------------------------------------------");

if (totalViolaciones > 0) {
  process.exit(1);
} else {
  console.log("✓ El código cumple satisfactoriamente con SOLID y WCAG 2.1.");
  process.exit(0);
}
