const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Definiciones de áreas y materias idénticas para validar compatibilidades de laboratorios
const AREAS = {
  PROGRAMACION: "PROGRAMACION",
  BD: "BD",
  REDES: "REDES",
  ING_SOFTWARE: "ING_SOFTWARE",
  ELECTRONICA: "ELECTRONICA",
  CIENCIAS_BASICAS: "CIENCIAS_BASICAS",
  HUMANIDADES: "HUMANIDADES",
  GESTION: "GESTION"
};

const MATERIAS_METADATA = {
  // Semestre 1
  "INF-101": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-102": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-103": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-104": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-105": { tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  "INF-106": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-107": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-108": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 2
  "INF-201": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-202": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-203": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-204": { tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  "INF-205": { tipo: "MIXTA", area: AREAS.ELECTRONICA },
  "INF-206": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-207": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-208": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 3
  "INF-301": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-302": { tipo: "PRACTICA", area: AREAS.BD },
  "INF-303": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-304": { tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  "INF-305": { tipo: "MIXTA", area: AREAS.ELECTRONICA },
  "INF-306": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-307": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-308": { tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 4
  "INF-401": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-402": { tipo: "PRACTICA", area: AREAS.BD },
  "INF-403": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-404": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-405": { tipo: "PRACTICA", area: AREAS.REDES },
  "INF-406": { tipo: "MIXTA", area: AREAS.ELECTRONICA },
  "INF-407": { tipo: "MIXTA", area: AREAS.PROGRAMACION },
  "INF-408": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 5
  "INF-501": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-502": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-503": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-504": { tipo: "PRACTICA", area: AREAS.REDES },
  "INF-505": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-506": { tipo: "PRACTICA", area: AREAS.REDES },
  "INF-507": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-508": { tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 6
  "INF-601": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-602": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-603": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-604": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-605": { tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-606": { tipo: "MIXTA", area: AREAS.REDES },
  "INF-607": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-608": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  // Semestre 7
  "INF-701": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-702": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-703": { tipo: "MIXTA", area: AREAS.REDES },
  "INF-704": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-705": { tipo: "PRACTICA", area: AREAS.REDES },
  "INF-706": { tipo: "PRACTICA", area: AREAS.BD },
  "INF-707": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-708": { tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 8
  "INF-801": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-802": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-803": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-804": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-805": { tipo: "MIXTA", area: AREAS.REDES },
  "INF-806": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-807": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-808": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 9
  "INF-901": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-902": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-903": { tipo: "PRACTICA", area: AREAS.BD },
  "INF-904": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-905": { tipo: "MIXTA", area: AREAS.REDES },
  "INF-906": { tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  "INF-907": { tipo: "PRACTICA", area: AREAS.CIENCIAS_BASICAS },
  "INF-908": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 10
  "INF-1001": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-1002": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-1003": { tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  "INF-1004": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-1005": { tipo: "TEORICA", area: AREAS.GESTION },
  "INF-1006": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-1007": { tipo: "TEORICA", area: AREAS.HUMANIDADES },
  "INF-1008": { tipo: "TEORICA", area: AREAS.HUMANIDADES }
};

async function main() {
  console.log("=== INICIANDO BATERÍA DE VERIFICACIONES POST-SEED ===");

  let pruebasPasadas = 0;
  let pruebasFalladas = 0;

  function registrarResultado(nombrePrueba, condicion, detalleError = "") {
    if (condicion) {
      console.log(`✅ [PASADA] ${nombrePrueba}`);
      pruebasPasadas++;
    } else {
      console.error(`❌ [FALLADA] ${nombrePrueba}`);
      if (detalleError) console.error(`   Detalle: ${detalleError}`);
      pruebasFalladas++;
    }
  }

  try {
    // Cargar datos
    const usuarios = await prisma.usuario.findMany();
    const docentes = await prisma.docente.findMany({ include: { usuario: true } });
    const salones = await prisma.salon.findMany();
    const materias = await prisma.materia.findMany();
    const periodos = await prisma.periodoAcademico.findMany();
    const horarios = await prisma.horario.findMany({
      include: { docente: { include: { usuario: true } }, salon: true, materia: true, labor: true, periodo: true }
    });

    console.log(`Cargados: ${usuarios.length} usuarios, ${docentes.length} docentes, ${salones.length} salones, ${materias.length} materias, ${periodos.length} periodos, ${horarios.length} horarios.`);

    // 1. No existen usuarios duplicados (por correo)
    const correosUsuarios = usuarios.map(u => u.correo.trim().toLowerCase());
    const correosUsuariosSet = new Set(correosUsuarios);
    registrarResultado(
      "No existen usuarios duplicados (Correo)",
      correosUsuariosSet.size === usuarios.length,
      `Usuarios totales: ${usuarios.length}, Correos únicos: ${correosUsuariosSet.size}`
    );

    // 2. No existen docentes duplicados (por identificacion)
    const idDocentes = docentes.map(d => d.identificacion.trim());
    const idDocentesSet = new Set(idDocentes);
    registrarResultado(
      "No existen docentes duplicados (Identificación)",
      idDocentesSet.size === docentes.length,
      `Docentes totales: ${docentes.length}, Identificaciones únicas: ${idDocentesSet.size}`
    );

    // 3. No existen salones duplicados (por nombre)
    const nombresSalones = salones.map(s => s.nombre.trim().toLowerCase());
    const nombresSalonesSet = new Set(nombresSalones);
    registrarResultado(
      "No existen salones duplicados (Nombre)",
      nombresSalonesSet.size === salones.length,
      `Salones totales: ${salones.length}, Nombres únicos: ${nombresSalonesSet.size}`
    );

    // 4. No existen materias duplicadas (por código)
    const codigosMaterias = materias.map(m => m.codigo.trim().toLowerCase());
    const codigosMateriasSet = new Set(codigosMaterias);
    registrarResultado(
      "No existen materias duplicadas (Código)",
      codigosMateriasSet.size === materias.length,
      `Materias totales: ${materias.length}, Códigos únicos: ${codigosMateriasSet.size}`
    );

    // 5. No existen periodos duplicados (por nombre)
    const nombresPeriodos = periodos.map(p => p.nombre.trim().toLowerCase());
    const nombresPeriodosSet = new Set(nombresPeriodos);
    registrarResultado(
      "No existen periodos duplicados (Nombre)",
      nombresPeriodosSet.size === periodos.length,
      `Periodos totales: ${periodos.length}, Nombres únicos: ${nombresPeriodosSet.size}`
    );

    // 6. No existen colisiones de docentes
    let colisionesDocentesCount = 0;
    const ocupacionDocentesMap = {};
    for (const h of horarios) {
      const pid = h.id_periodo;
      const did = h.id_docente;
      const dia = h.dia_semana;
      const hora = h.hora_inicio;
      if (!ocupacionDocentesMap[pid]) ocupacionDocentesMap[pid] = {};
      if (!ocupacionDocentesMap[pid][did]) ocupacionDocentesMap[pid][did] = {};
      if (!ocupacionDocentesMap[pid][did][dia]) ocupacionDocentesMap[pid][did][dia] = {};
      ocupacionDocentesMap[pid][did][dia][hora] = (ocupacionDocentesMap[pid][did][dia][hora] || 0) + 1;
      if (ocupacionDocentesMap[pid][did][dia][hora] > 1) colisionesDocentesCount++;
    }
    registrarResultado(
      "No existen colisiones de docentes (mismo docente en dos lugares)",
      colisionesDocentesCount === 0,
      `Cruces encontrados: ${colisionesDocentesCount}`
    );

    // 7. No existen colisiones de salones
    let colisionesSalonesCount = 0;
    const ocupacionSalonesMap = {};
    for (const h of horarios) {
      const pid = h.id_periodo;
      const sid = h.id_salon;
      const dia = h.dia_semana;
      const hora = h.hora_inicio;
      if (!ocupacionSalonesMap[pid]) ocupacionSalonesMap[pid] = {};
      if (!ocupacionSalonesMap[pid][sid]) ocupacionSalonesMap[pid][sid] = {};
      if (!ocupacionSalonesMap[pid][sid][dia]) ocupacionSalonesMap[pid][sid][dia] = {};
      ocupacionSalonesMap[pid][sid][dia][hora] = (ocupacionSalonesMap[pid][sid][dia][hora] || 0) + 1;
      if (ocupacionSalonesMap[pid][sid][dia][hora] > 1) colisionesSalonesCount++;
    }
    registrarResultado(
      "No existen colisiones de salones (mismo salón ocupado dos veces)",
      colisionesSalonesCount === 0,
      `Cruces encontrados: ${colisionesSalonesCount}`
    );

    // 8. Ningún docente supera su carga semanal contratada
    let docentesExcedidosCount = 0;
    const docenteHorasPorPeriodo = {};
    for (const h of horarios) {
      const pid = h.id_periodo;
      const did = h.id_docente;
      if (!docenteHorasPorPeriodo[pid]) docenteHorasPorPeriodo[pid] = {};
      docenteHorasPorPeriodo[pid][did] = (docenteHorasPorPeriodo[pid][did] || 0) + 2;
    }
    for (const pid in docenteHorasPorPeriodo) {
      for (const did in docenteHorasPorPeriodo[pid]) {
        const docRecord = docentes.find(d => d.id_docente === parseInt(did));
        const horasAsignadas = docenteHorasPorPeriodo[pid][did];
        if (docRecord && horasAsignadas > docRecord.horas_semanales_maximas) {
          docentesExcedidosCount++;
        }
      }
    }
    registrarResultado(
      "Ningún docente supera su carga máxima contratada",
      docentesExcedidosCount === 0,
      `Docentes excedidos encontrados: ${docentesExcedidosCount}`
    );

    // 9. Todas las materias del horario tienen docente
    const materiasSinDocente = horarios.filter(h => h.id_materia && (!h.id_docente || !h.docente));
    registrarResultado(
      "Todas las materias del horario tienen docente",
      materiasSinDocente.length === 0,
      `Horarios de materias sin docente: ${materiasSinDocente.length}`
    );

    // 10. Todos los horarios tienen salón
    const horariosSinSalon = horarios.filter(h => !h.id_salon || !h.salon);
    registrarResultado(
      "Todos los horarios tienen salón",
      horariosSinSalon.length === 0,
      `Horarios sin salón: ${horariosSinSalon.length}`
    );

    // 11. Todos los horarios tienen periodo
    const horariosSinPeriodo = horarios.filter(h => !h.id_periodo || !h.periodo);
    registrarResultado(
      "Todos los horarios tienen periodo",
      horariosSinPeriodo.length === 0,
      `Horarios sin periodo: ${horariosSinPeriodo.length}`
    );

    // 12. Todas las materias del mismo semestre pueden cursarse sin traslapes
    let colisionesSemestreCount = 0;
    const ocupacionSemestresMap = {};
    for (const h of horarios) {
      if (!h.materia) continue;
      const pid = h.id_periodo;
      const dia = h.dia_semana;
      const hora = h.hora_inicio;
      const matches = h.materia.nombre.match(/Semestre\s(I|II|III|IV|V|VI|VII|VIII|IX|X)/);
      let semestreNum = 1;
      if (matches) {
        const roman = matches[1];
        const ROMANS = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10 };
        semestreNum = ROMANS[roman] || 1;
      }
      if (!ocupacionSemestresMap[pid]) ocupacionSemestresMap[pid] = {};
      if (!ocupacionSemestresMap[pid][semestreNum]) ocupacionSemestresMap[pid][semestreNum] = {};
      if (!ocupacionSemestresMap[pid][semestreNum][dia]) ocupacionSemestresMap[pid][semestreNum][dia] = {};
      ocupacionSemestresMap[pid][semestreNum][dia][hora] = (ocupacionSemestresMap[pid][semestreNum][dia][hora] || 0) + 1;
      if (ocupacionSemestresMap[pid][semestreNum][dia][hora] > 1) colisionesSemestreCount++;
    }
    registrarResultado(
      "Todas las materias del mismo semestre pueden cursarse sin traslapes",
      colisionesSemestreCount === 0,
      `Traslapes semestrales encontrados: ${colisionesSemestreCount}`
    );

    // 13. Todas las materias prácticas quedaron en laboratorio
    let practicasFueraDeLaboratorio = 0;
    for (const h of horarios) {
      if (!h.materia) continue;
      const meta = MATERIAS_METADATA[h.materia.codigo];
      if (meta && (meta.tipo === "PRACTICA" || meta.tipo === "MIXTA")) {
        if (!h.salon.tipo.startsWith("LABORATORIO")) {
          practicasFueraDeLaboratorio++;
          console.warn(`⚠️ Materia práctica ${h.materia.nombre} asignada a salón de tipo ${h.salon.tipo} (${h.salon.nombre})`);
        }
      }
    }
    registrarResultado(
      "Todas las materias prácticas quedaron en laboratorio",
      practicasFueraDeLaboratorio === 0,
      `Materias prácticas en salón inadecuado: ${practicasFueraDeLaboratorio}`
    );

    // 14. Todas las materias teóricas quedaron en aulas/auditorios/salas multimedia
    let teoricasFueraDeAulas = 0;
    for (const h of horarios) {
      if (!h.materia) continue;
      const meta = MATERIAS_METADATA[h.materia.codigo];
      if (meta && meta.tipo === "TEORICA") {
        if (h.salon.tipo.startsWith("LABORATORIO")) {
          teoricasFueraDeAulas++;
          console.warn(`⚠️ Materia teórica ${h.materia.nombre} asignada a laboratorio (${h.salon.nombre})`);
        }
      }
    }
    registrarResultado(
      "Todas las materias teóricas quedaron en aulas/auditorios/multimedia",
      teoricasFueraDeAulas === 0,
      `Materias teóricas en laboratorio: ${teoricasFueraDeAulas}`
    );

    console.log("\n=== COMPLIANCE REPORT ===");
    console.log(`Total de pruebas ejecutadas: ${pruebasPasadas + pruebasFalladas}`);
    console.log(`Pruebas PASADAS: ${pruebasPasadas}`);
    console.log(`Pruebas FALLADAS: ${pruebasFalladas}`);

    if (pruebasFalladas === 0) {
      console.log("\n🎉 ¡ENTORNO DE PRUEBAS COMPLETAMENTE COMPLIANTE CON REGLAS UNIVERSITARIAS!");
    } else {
      console.log("\n⚠️ Se detectaron inconsistencias en el entorno de pruebas.");
    }

  } catch (error) {
    console.error("Error al ejecutar las verificaciones post-seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
