const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clean up Materias from tests
  const materiasBorradas = await prisma.materia.deleteMany({
    where: {
      NOT: {
        codigo: {
          startsWith: "INF-"
        }
      }
    }
  });
  console.log("Deleted test materias:", materiasBorradas.count);

  // Since some test materias might start with INF- but followed by letters or non-digits (e.g., INF-TEST, INF-7262)
  const allMaterias = await prisma.materia.findMany();
  for (const m of allMaterias) {
    if (!/^INF-\d+$/.test(m.codigo)) {
      await prisma.horario.deleteMany({ where: { id_materia: m.id_materia } });
      await prisma.materia.delete({ where: { id_materia: m.id_materia } });
      console.log("Deleted custom test materia:", m.codigo);
    }
  }

  // Clean up Salones from tests
  const salonesBorrados = await prisma.salon.deleteMany({
    where: {
      OR: [
        { nombre: { contains: "Calidad" } },
        { nombre: { contains: "Prueba" } }
      ]
    }
  });
  console.log("Deleted test salones:", salonesBorrados.count);

  // Clean up Docentes/Usuarios from tests
  const usuariosABorrar = await prisma.usuario.findMany({
    where: {
      OR: [
        { correo: { contains: "prueba" } },
        { correo: { contains: "calvache" } },
        { correo: { contains: "dup" } }
      ]
    }
  });
  for (const u of usuariosABorrar) {
    await prisma.horario.deleteMany({ where: { id_docente: u.id_usuario } });
    await prisma.docente.deleteMany({ where: { id_docente: u.id_usuario } });
    await prisma.usuario.delete({ where: { id_usuario: u.id_usuario } });
    console.log("Deleted test user:", u.correo);
  }

  // Print final counts
  const countDocentes = await prisma.docente.count();
  const countMaterias = await prisma.materia.count();
  const countSalones = await prisma.salon.count();
  const countHorarios = await prisma.horario.count();
  const countPeriodos = await prisma.periodoAcademico.count();

  console.log("=== FINAL CLEANUP COUNTS ===");
  console.log("Docentes:", countDocentes);
  console.log("Materias:", countMaterias);
  console.log("Salones:", countSalones);
  console.log("Horarios:", countHorarios);
  console.log("Periodos:", countPeriodos);
}

main().catch(console.error).finally(() => prisma.$disconnect());
