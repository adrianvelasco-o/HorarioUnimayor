const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Nombres y Apellidos realistas para generar docentes
const NOMBRES = [
  "Alejandro", "Beatriz", "Carlos", "Diana", "Eduardo", "Fabiola", "Gustavo", "Helena", "Iván", "Jacqueline",
  "Kevin", "Laura", "Mauricio", "Natalia", "Oscar", "Patricia", "Quirino", "Rosa", "Santiago", "Teresa",
  "Uriel", "Valeria", "William", "Ximena", "Yamid", "Zulma", "Andrés", "Camila", "Daniel", "Elena",
  "Fernando", "Gabriela", "Hugo", "Isabel", "Jaime", "Karla", "Luis", "Mónica", "Néstor", "Olga",
  "Pedro", "Raquel", "Sergio", "Tatiana", "Ulises", "Verónica", "Walter", "Yolanda", "Adrián", "Ginna"
];

const APELLIDOS = [
  "Gómez", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Díaz",
  "Vargas", "Castro", "Morales", "Herrera", "Medina", "Muñoz", "Rojas", "Solís", "Silva", "Delgado",
  "Ríos", "Ortega", "Mendoza", "Cardona", "Ruiz", "Guerrero", "Marín", "Salazar", "Guzmán", "Pino",
  "Ocampo", "Dorado", "Paz", "Navia", "Ordóñez", "Calvache", "Grajales", "Mina", "Velasco", "Mosquera",
  "Montilla", "Erazo", "Sarabia", "Burbano", "Bolaños", "Chávez", "Jiménez", "Benavides", "Reina", "Suárez"
];

// Áreas de especialidad de materias y docentes
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

// Asignación de especialidad a cada docente secuencialmente
const ESPECIALIDADES_DOCENTES = [
  AREAS.PROGRAMACION, AREAS.BD, AREAS.REDES, AREAS.ING_SOFTWARE, AREAS.ELECTRONICA,
  AREAS.CIENCIAS_BASICAS, AREAS.HUMANIDADES, AREAS.GESTION
];

// Lista de 80 materias de Ingeniería Informática estructuradas por semestre (8 por semestre)
const MATERIAS_DEFINICION = [
  // Semestre 1
  { codigo: "INF-101", nombre: "[Semestre I] Programación I", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-102", nombre: "[Semestre I] Introducción a la Ingeniería", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-103", nombre: "[Semestre I] Matemáticas I", creditos: 4, horas: 4, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-104", nombre: "[Semestre I] Álgebra Lineal", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-105", nombre: "[Semestre I] Química General", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-106", nombre: "[Semestre I] Competencias Comunicativas", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-107", nombre: "[Semestre I] Cátedra Institucional", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-108", nombre: "[Semestre I] Deporte y Cultura", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 2
  { codigo: "INF-201", nombre: "[Semestre II] Programación II", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-202", nombre: "[Semestre II] Estructuras de Datos", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-203", nombre: "[Semestre II] Matemáticas II", creditos: 4, horas: 4, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-204", nombre: "[Semestre II] Física Mecánica", creditos: 4, horas: 4, tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-205", nombre: "[Semestre II] Electrónica Básica", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.ELECTRONICA },
  { codigo: "INF-206", nombre: "[Semestre II] Metodología de la Investigación", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-207", nombre: "[Semestre II] Inglés I", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-208", nombre: "[Semestre II] Ética Profesional", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 3
  { codigo: "INF-301", nombre: "[Semestre III] Programación Orientada a Objetos", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-302", nombre: "[Semestre III] Bases de Datos I", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.BD },
  { codigo: "INF-303", nombre: "[Semestre III] Matemáticas III", creditos: 4, horas: 4, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-304", nombre: "[Semestre III] Física Electromagnética", creditos: 4, horas: 4, tipo: "MIXTA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-305", nombre: "[Semestre III] Electrónica Digital", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.ELECTRONICA },
  { codigo: "INF-306", nombre: "[Semestre III] Constitución Política", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-307", nombre: "[Semestre III] Inglés II", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-308", nombre: "[Semestre III] Emprendimiento", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 4
  { codigo: "INF-401", nombre: "[Semestre IV] Ingeniería de Software I", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-402", nombre: "[Semestre IV] Bases de Datos II", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.BD },
  { codigo: "INF-403", nombre: "[Semestre IV] Métodos Numéricos", creditos: 3, horas: 2, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-404", nombre: "[Semestre IV] Teoría de Sistemas", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-405", nombre: "[Semestre IV] Redes de Computadores I", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.REDES },
  { codigo: "INF-406", nombre: "[Semestre IV] Arquitectura de Computadores", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.ELECTRONICA },
  { codigo: "INF-407", nombre: "[Semestre IV] Sistemas Operativos", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.PROGRAMACION },
  { codigo: "INF-408", nombre: "[Semestre IV] Inglés III", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 5
  { codigo: "INF-501", nombre: "[Semestre V] Ingeniería de Software II", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-502", nombre: "[Semestre V] Análisis y Diseño de Algoritmos", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-503", nombre: "[Semestre V] Investigación de Operaciones", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-504", nombre: "[Semestre V] Redes de Computadores II", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.REDES },
  { codigo: "INF-505", nombre: "[Semestre V] Computación Gráfica", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-506", nombre: "[Semestre V] Sistemas Distribuidos", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.REDES },
  { codigo: "INF-507", nombre: "[Semestre V] Inglés IV", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-508", nombre: "[Semestre V] Formulación de Proyectos", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 6
  { codigo: "INF-601", nombre: "[Semestre VI] Gestión de Proyectos de Software", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-602", nombre: "[Semestre VI] Lenguajes de Programación", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-603", nombre: "[Semestre VI] Programación Web", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-604", nombre: "[Semestre VI] Inteligencia Artificial", creditos: 4, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-605", nombre: "[Semestre VI] Teoría de la Computación", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-606", nombre: "[Semestre VI] Telemática", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.REDES },
  { codigo: "INF-607", nombre: "[Semestre VI] Electiva Técnica I", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-608", nombre: "[Semestre VI] Aseguramiento de Calidad", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  // Semestre 7
  { codigo: "INF-701", nombre: "[Semestre VII] Arquitectura de Software", creditos: 4, horas: 4, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-702", nombre: "[Semestre VII] Programación Móvil", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-703", nombre: "[Semestre VII] Seguridad de la Información", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.REDES },
  { codigo: "INF-704", nombre: "[Semestre VII] Auditoría de Sistemas", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-705", nombre: "[Semestre VII] Computación en la Nube", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.REDES },
  { codigo: "INF-706", nombre: "[Semestre VII] Minería de Datos", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.BD },
  { codigo: "INF-707", nombre: "[Semestre VII] Electiva Técnica II", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-708", nombre: "[Semestre VII] Gerencia de TI", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  // Semestre 8
  { codigo: "INF-801", nombre: "[Semestre VIII] Proyecto de Grado I", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-802", nombre: "[Semestre VIII] Práctica Profesional", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-803", nombre: "[Semestre VIII] Ética en Ingeniería", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-804", nombre: "[Semestre VIII] Sistemas Inteligentes", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-805", nombre: "[Semestre VIII] Redes Inalámbricas", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.REDES },
  { codigo: "INF-806", nombre: "[Semestre VIII] Gestión Tecnológica", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-807", nombre: "[Semestre VIII] Electiva Técnica III", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-808", nombre: "[Semestre VIII] Humanidades I", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 9
  { codigo: "INF-901", nombre: "[Semestre IX] Proyecto de Grado II", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-902", nombre: "[Semestre IX] Arquitecturas Emergentes", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-903", nombre: "[Semestre IX] Ciencia de Datos", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.BD },
  { codigo: "INF-904", nombre: "[Semestre IX] Gestión del Conocimiento", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-905", nombre: "[Semestre IX] Redes de Nueva Generación", creditos: 3, horas: 4, tipo: "MIXTA", area: AREAS.REDES },
  { codigo: "INF-906", nombre: "[Semestre IX] Electiva Técnica IV", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.PROGRAMACION },
  { codigo: "INF-907", nombre: "[Semestre IX] Simulación de Sistemas", creditos: 3, horas: 4, tipo: "PRACTICA", area: AREAS.CIENCIAS_BASICAS },
  { codigo: "INF-908", nombre: "[Semestre IX] Humanidades II", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  // Semestre 10
  { codigo: "INF-1001", nombre: "[Semestre X] Práctica de Ingeniería", creditos: 4, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-1002", nombre: "[Semestre X] Alta Gerencia", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-1003", nombre: "[Semestre X] Seminario de Actualización", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.ING_SOFTWARE },
  { codigo: "INF-1004", nombre: "[Semestre X] Derecho Informático", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-1005", nombre: "[Semestre X] Evaluacion de Proyectos", creditos: 3, horas: 4, tipo: "TEORICA", area: AREAS.GESTION },
  { codigo: "INF-1006", nombre: "[Semestre X] Electiva Libre", creditos: 2, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-1007", nombre: "[Semestre X] Desarrollo Humano", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES },
  { codigo: "INF-1008", nombre: "[Semestre X] Responsabilidad Social", creditos: 1, horas: 2, tipo: "TEORICA", area: AREAS.HUMANIDADES }
];

// Labores Académicas realistas (25)
const LABORES_DEFINICION = [
  { nombre: "Tutorías Académicas", horas: 4, desc: "Asesorías personalizadas a estudiantes de Ingeniería Informática." },
  { nombre: "Investigación - Grupo de Software", horas: 10, desc: "Desarrollo de proyectos de I+D en ingeniería de software." },
  { nombre: "Investigación - Redes Inteligentes", horas: 12, desc: "Investigación en redes IoT y conectividad inalámbrica." },
  { nombre: "Semillero de Desarrollo Web", horas: 4, desc: "Capacitación extracurricular de estudiantes en tecnologías modernas de frontend/backend." },
  { nombre: "Comité Curricular de Ingeniería", horas: 2, desc: "Reuniones periódicas de rediseño y actualización curricular." },
  { nombre: "Dirección de Trabajo de Grado I", horas: 3, desc: "Asesoría metodológica en proyectos de investigación." },
  { nombre: "Dirección de Trabajo de Grado II", horas: 3, desc: "Asesoría metodológica final y revisión de tesis de grado." },
  { nombre: "Coordinación de Laboratorios", horas: 6, desc: "Gestión de recursos y licencias de software académico." },
  { nombre: "Proyectos de Extensión Social", horas: 6, desc: "Capacitación en TICs a comunidades vulnerables del Cauca." },
  { nombre: "Autoevaluación y Acreditación", horas: 4, desc: "Elaboración de informes con miras a la Acreditación de Alta Calidad." },
  { nombre: "Asesoría de Prácticas Profesionales", horas: 4, desc: "Seguimiento a estudiantes en empresas aliadas." },
  { nombre: "Comité de Ética en Investigación", horas: 2, desc: "Revisión de aspectos bioéticos en proyectos universitarios." },
  { nombre: "Preparación de Material Didáctico", horas: 8, desc: "Redacción de guías de laboratorio y material digital." },
  { nombre: "Evaluación de Artículos Científicos", horas: 2, desc: "Par evaluador de revistas institucionales." },
  { nombre: "Coordinación de Semestre I y II", horas: 4, desc: "Seguimiento a la deserción de estudiantes nuevos." },
  { nombre: "Semillero de Inteligencia Artificial", horas: 4, desc: "Estudio de algoritmos de machine learning con estudiantes." },
  { nombre: "Comité de Bienestar Institucional", horas: 2, desc: "Apoyo a actividades culturales y deportivas." },
  { nombre: "Diseño de Entornos Virtuales Moodle", horas: 6, desc: "Administración y subida de contenidos al aula virtual." },
  { nombre: "Internacionalización del Currículo", horas: 4, desc: "Gestión de convenios de doble titulación con universidades extranjeras." },
  { nombre: "Coordinación de Prácticas de Ingeniería", horas: 4, desc: "Vinculación universidad-empresa." },
  { nombre: "Asistencia a Eventos Académicos", horas: 2, desc: "Representación en ponencias y congresos." },
  { nombre: "Comité Editorial de la Revista", horas: 2, desc: "Edición y selección de artículos tecnológicos." },
  { nombre: "Gestión de Convenios Marco", horas: 4, desc: "Renovación de alianzas estratégicas." },
  { nombre: "Semillero de Ciberseguridad", horas: 4, desc: "Prácticas de hacking ético y seguridad de redes." },
  { nombre: "Comité de Admisiones Académicas", horas: 2, desc: "Entrevistas e ingreso de nuevos estudiantes." }
];

// Bloques horarios de 2 horas (Días: Lunes a Sábado)
const BLOQUES_HORARIOS = [
  { inicio: "07:00", fin: "09:00" },
  { inicio: "09:00", fin: "11:00" },
  { inicio: "11:00", fin: "13:00" },
  { inicio: "14:00", fin: "16:00" },
  { inicio: "16:00", fin: "18:00" },
  { inicio: "18:00", fin: "20:00" },
  { inicio: "20:00", fin: "22:00" }
];

const DIAS_SEMANA = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

async function main() {
  console.log("=== INICIANDO SEMBRADO MASIVO ACADÉMICO REAL ===");

  // 1. Limpieza de base de datos en orden jerárquico inverso de dependencias
  console.log("Limpiando datos antiguos...");
  await prisma.horario.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.administrador.deleteMany({});
  await prisma.historialUsuario.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.rolPermiso.deleteMany({});
  await prisma.permiso.deleteMany({});
  await prisma.rol.deleteMany({});
  await prisma.materia.deleteMany({});
  await prisma.labor.deleteMany({});
  await prisma.salon.deleteMany({});
  await prisma.periodoAcademico.deleteMany({});
  console.log("Base de datos limpia.");

  // 2. Creación de Roles
  console.log("Creando Roles...");
  const rolAdmin = await prisma.rol.create({
    data: { nombre: "Administrador", descripcion: "Administrador con control total del sistema" }
  });
  const rolSecretario = await prisma.rol.create({
    data: { nombre: "Secretario Académico", descripcion: "Apoyo en la gestión de horarios y consultas" }
  });
  const rolCoordinador = await prisma.rol.create({
    data: { nombre: "Coordinador de Programa", descripcion: "Coordinador de Ingeniería Informática con control académico" }
  });
  const rolDocente = await prisma.rol.create({
    data: { nombre: "Docente", descripcion: "Docente con acceso a sus horarios asignados" }
  });
  const rolConsulta = await prisma.rol.create({
    data: { nombre: "Consulta", descripcion: "Usuario de consulta pública (Solo Lectura)" }
  });

  // 2.5 Creación de Catálogo de Permisos
  console.log("Creando Catálogo de Permisos...");
  const permisosDefinicion = [
    // Módulo Usuarios
    { codigo: "USUARIOS_VER", nombre: "Visualizar usuarios", modulo: "Usuarios", accion: "Ver", descripcion: "Permite ver la lista de usuarios del sistema" },
    { codigo: "USUARIOS_CREAR", nombre: "Crear usuarios", modulo: "Usuarios", accion: "Crear", descripcion: "Permite registrar nuevos usuarios" },
    { codigo: "USUARIOS_EDITAR", nombre: "Editar usuarios", modulo: "Usuarios", accion: "Editar", descripcion: "Permite modificar datos de usuarios" },
    { codigo: "USUARIOS_ELIMINAR", nombre: "Eliminar usuarios", modulo: "Usuarios", accion: "Eliminar", descripcion: "Permite eliminar usuarios del sistema" },
    { codigo: "USUARIOS_ACTIVAR", nombre: "Activar/Desactivar usuarios", modulo: "Usuarios", accion: "Activar", descripcion: "Permite habilitar o deshabilitar usuarios" },
    { codigo: "USUARIOS_HISTORIAL", nombre: "Ver historial de usuarios", modulo: "Usuarios", accion: "Historial", descripcion: "Permite consultar la auditoría de un usuario" },

    // Módulo Roles
    { codigo: "ROLES_VER", nombre: "Visualizar roles", modulo: "Roles", accion: "Ver", descripcion: "Permite ver la lista de roles" },
    { codigo: "ROLES_CREAR", nombre: "Crear roles", modulo: "Roles", accion: "Crear", descripcion: "Permite crear nuevos roles" },
    { codigo: "ROLES_EDITAR", nombre: "Editar roles", modulo: "Roles", accion: "Editar", descripcion: "Permite modificar roles existentes" },
    { codigo: "ROLES_ELIMINAR", nombre: "Eliminar roles", modulo: "Roles", accion: "Eliminar", descripcion: "Permite eliminar roles no utilizados" },

    // Módulo Permisos
    { codigo: "PERMISOS_VER", nombre: "Visualizar permisos", modulo: "Permisos", accion: "Ver", descripcion: "Permite ver catálogo de permisos" },
    { codigo: "PERMISOS_ASIGNAR", nombre: "Asignar permisos", modulo: "Permisos", accion: "Asignar", descripcion: "Permite modificar la matriz de permisos de un rol" },

    // Módulo Horarios
    { codigo: "HORARIOS_VER", nombre: "Visualizar horarios", modulo: "Horarios", accion: "Ver", descripcion: "Permite consultar horarios de clase" },
    { codigo: "HORARIOS_CREAR", nombre: "Crear horarios", modulo: "Horarios", accion: "Crear", descripcion: "Permite programar nuevos bloques horarios" },
    { codigo: "HORARIOS_EDITAR", nombre: "Editar horarios", modulo: "Horarios", accion: "Editar", descripcion: "Permite modificar horarios existentes" },
    { codigo: "HORARIOS_ELIMINAR", nombre: "Eliminar horarios", modulo: "Horarios", accion: "Eliminar", descripcion: "Permite borrar programaciones de horarios" },

    // Módulo Docentes
    { codigo: "DOCENTES_VER", nombre: "Visualizar docentes", modulo: "Docentes", accion: "Ver", descripcion: "Permite ver lista de docentes" },
    { codigo: "DOCENTES_CREAR", nombre: "Crear docentes", modulo: "Docentes", accion: "Crear", descripcion: "Permite registrar datos académicos de docentes" },
    { codigo: "DOCENTES_EDITAR", nombre: "Editar docentes", modulo: "Docentes", accion: "Editar", descripcion: "Permite actualizar datos de docentes" },
    { codigo: "DOCENTES_ELIMINAR", nombre: "Eliminar docentes", modulo: "Docentes", accion: "Eliminar", descripcion: "Permite borrar docentes del sistema" },

    // Módulo Salones
    { codigo: "SALONES_VER", nombre: "Visualizar salones", modulo: "Salones", accion: "Ver", descripcion: "Permite ver lista de ambientes y aulas" },
    { codigo: "SALONES_CREAR", nombre: "Crear salones", modulo: "Salones", accion: "Crear", descripcion: "Permite crear nuevos salones" },
    { codigo: "SALONES_EDITAR", nombre: "Editar salones", modulo: "Salones", accion: "Editar", descripcion: "Permite modificar salones" },
    { codigo: "SALONES_ELIMINAR", nombre: "Eliminar salones", modulo: "Salones", accion: "Eliminar", descripcion: "Permite eliminar aulas" },

    // Módulo Periodos
    { codigo: "PERIODOS_VER", nombre: "Visualizar periodos", modulo: "Periodos", accion: "Ver", descripcion: "Permite ver periodos académicos" },
    { codigo: "PERIODOS_CREAR", nombre: "Crear periodos", modulo: "Periodos", accion: "Crear", descripcion: "Permite crear nuevos periodos" },
    { codigo: "PERIODOS_EDITAR", nombre: "Editar periodos", modulo: "Periodos", accion: "Editar", descripcion: "Permite modificar fechas y activar periodos" },
    { codigo: "PERIODOS_ELIMINAR", nombre: "Eliminar periodos", modulo: "Periodos", accion: "Eliminar", descripcion: "Permite eliminar periodos sin horarios" },

    // Módulo Materias
    { codigo: "MATERIAS_VER", nombre: "Visualizar materias", modulo: "Materias", accion: "Ver", descripcion: "Permite ver pensum y asignaturas" },
    { codigo: "MATERIAS_CREAR", nombre: "Crear materias", modulo: "Materias", accion: "Crear", descripcion: "Permite registrar asignaturas" },
    { codigo: "MATERIAS_EDITAR", nombre: "Editar materias", modulo: "Materias", accion: "Editar", descripcion: "Permite editar materias" },
    { codigo: "MATERIAS_ELIMINAR", nombre: "Eliminar materias", modulo: "Materias", accion: "Eliminar", descripcion: "Permite borrar materias" },

    // Módulo Labores
    { codigo: "LABORES_VER", nombre: "Visualizar labores", modulo: "Labores", accion: "Ver", descripcion: "Permite ver labores no lectivas" },
    { codigo: "LABORES_CREAR", nombre: "Crear labores", modulo: "Labores", accion: "Crear", descripcion: "Permite crear labores" },
    { codigo: "LABORES_EDITAR", nombre: "Editar labores", modulo: "Labores", accion: "Editar", descripcion: "Permite editar labores" },
    { codigo: "LABORES_ELIMINAR", nombre: "Eliminar labores", modulo: "Labores", accion: "Eliminar", descripcion: "Permite borrar labores" },

    // Módulo Auditoría
    { codigo: "AUDITORIA_VER", nombre: "Visualizar logs de auditoría", modulo: "Auditoría", accion: "Ver", descripcion: "Permite revisar el historial de auditoría de seguridad global" },

    // Nuevos Permisos Dinámicos para Dashboard y Vistas Específicas
    { codigo: "MI_HORARIO_VER", nombre: "Visualizar mi horario docente", modulo: "Docentes", accion: "Ver", descripcion: "Permite ver el horario propio del docente" },
    { codigo: "MIS_MATERIAS_VER", nombre: "Visualizar mis materias asignadas", modulo: "Docentes", accion: "Ver", descripcion: "Permite ver las materias asignadas al docente" },
    { codigo: "MIS_LABORES_VER", nombre: "Visualizar mis labores asignadas", modulo: "Docentes", accion: "Ver", descripcion: "Permite ver las labores asignadas al docente" },
    { codigo: "MI_PERFIL_VER", nombre: "Visualizar mi perfil personal", modulo: "Perfil", accion: "Ver", descripcion: "Permite visualizar el perfil propio" },
    { codigo: "REPORTES_VER", nombre: "Visualizar reportes", modulo: "Reportes", accion: "Ver", descripcion: "Permite visualizar reportes académicos" },
    { codigo: "ALERTAS_VER", nombre: "Visualizar alertas", modulo: "Alertas", accion: "Ver", descripcion: "Permite ver alertas de conflicto o colisiones" },
    { codigo: "ACCESOS_RAPIDOS_VER", nombre: "Visualizar accesos rápidos", modulo: "Dashboard", accion: "Ver", descripcion: "Permite ver accesos rápidos de administración" }
  ];

  const permisosCreados = {};
  for (const perm of permisosDefinicion) {
    const p = await prisma.permiso.create({
      data: perm
    });
    permisosCreados[perm.codigo] = p.id_permiso;
  }

  // Relacionar Rol y Permisos
  console.log("Relacionando Roles y Permisos...");
  
  // 1. Administrador (Todo)
  for (const cod of Object.keys(permisosCreados)) {
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id_rol, id_permiso: permisosCreados[cod] }
    });
  }

  async function asignarPermisos(idRol, codigos) {
    for (const cod of codigos) {
      if (permisosCreados[cod]) {
        await prisma.rolPermiso.create({
          data: { id_rol: idRol, id_permiso: permisosCreados[cod] }
        });
      }
    }
  }

  // 2. Coordinador de Programa (Gestión Académica completa, sin seguridad)
  const permisosCoordinador = Object.keys(permisosCreados).filter(
    cod => !cod.startsWith("USUARIOS_") && !cod.startsWith("ROLES_") && !cod.startsWith("PERMISOS_") && cod !== "AUDITORIA_VER"
  ).concat(["USUARIOS_VER"]);
  await asignarPermisos(rolCoordinador.id_rol, permisosCoordinador);

  // 3. Secretario Académico (Gestión parcial de horarios y visualizaciones)
  // 3. Secretario Académico (Gestión parcial de horarios y visualizaciones)
  const permisosSecretario = [
    "HORARIOS_VER", "HORARIOS_CREAR", "HORARIOS_EDITAR",
    "DOCENTES_VER", "SALONES_VER", "PERIODOS_VER", "MATERIAS_VER", "LABORES_VER",
    "REPORTES_VER", "MI_PERFIL_VER"
  ];
  await asignarPermisos(rolSecretario.id_rol, permisosSecretario);

  // 4. Docente (Solo ver horarios y recursos propios)
  const permisosDocente = [
    "HORARIOS_VER", "DOCENTES_VER", "SALONES_VER", "PERIODOS_VER", "MATERIAS_VER", "LABORES_VER",
    "MI_HORARIO_VER", "MIS_MATERIAS_VER", "MIS_LABORES_VER", "MI_PERFIL_VER"
  ];
  await asignarPermisos(rolDocente.id_rol, permisosDocente);

  // 5. Consulta (Solo Lectura)
  const permisosConsulta = [
    "HORARIOS_VER", "DOCENTES_VER", "SALONES_VER", "PERIODOS_VER", "MATERIAS_VER", "LABORES_VER",
    "MI_PERFIL_VER"
  ];
  await asignarPermisos(rolConsulta.id_rol, permisosConsulta);

  // 3. Creación de 3 Administradores Reales
  console.log("Creando Administradores...");
  const contrasenaAdminHash = await bcrypt.hash("Admin123*", 10);
  const adminsDefinicion = [
    { correo: "admin1@unimayor.edu.co", nombres: "Carlos Hugo", apellidos: "Guzmán", telefono: "3007654321" },
    { correo: "admin2@unimayor.edu.co", nombres: "Martha Sofia", apellidos: "Velasco", telefono: "3154567890" },
    { correo: "admin3@unimayor.edu.co", nombres: "Jorge Eliecer", apellidos: "Ordóñez", telefono: "3109876543" }
  ];

  for (const adminData of adminsDefinicion) {
    const usr = await prisma.usuario.create({
      data: {
        nombres: adminData.nombres,
        apellidos: adminData.apellidos,
        correo: adminData.correo,
        contrasena: contrasenaAdminHash,
        id_rol: rolAdmin.id_rol
      }
    });
    await prisma.administrador.create({
      data: {
        id_administrador: usr.id_usuario,
        telefono: adminData.telefono
      }
    });
  }

  // 3.5 Creación de Usuarios de Otros Roles Iniciales
  console.log("Creando otros usuarios institucionales...");
  const contrasenaOtrosHash = await bcrypt.hash("Docente123*", 10);
  
  // Secretario Académico
  await prisma.usuario.create({
    data: {
      nombres: "Juan",
      apellidos: "Secretario",
      correo: "secretario@unimayor.edu.co",
      contrasena: contrasenaOtrosHash,
      id_rol: rolSecretario.id_rol
    }
  });

  // Coordinador de Programa
  await prisma.usuario.create({
    data: {
      nombres: "Ana",
      apellidos: "Coordinadora",
      correo: "coordinador@unimayor.edu.co",
      contrasena: contrasenaOtrosHash,
      id_rol: rolCoordinador.id_rol
    }
  });

  // Usuario de Consulta
  await prisma.usuario.create({
    data: {
      nombres: "Pedro",
      apellidos: "Consulta",
      correo: "consulta@unimayor.edu.co",
      contrasena: contrasenaOtrosHash,
      id_rol: rolConsulta.id_rol
    }
  });

  // 4. Creación de 50 Docentes Reales con contratos distribuidos
  console.log("Creando 50 Docentes...");
  const contrasenaDocenteHash = await bcrypt.hash("Docente123*", 10);
  const docentesCreados = [];

  for (let i = 0; i < 50; i++) {
    const nombres = NOMBRES[i % NOMBRES.length];
    const apellidos = APELLIDOS[i % APELLIDOS.length];
    
    // Correo único sin acentos ni diacríticos
    const correoClean = `${nombres.toLowerCase()}.${apellidos.toLowerCase()}${i}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n");
    const correo = `${correoClean}@unimayor.edu.co`;
    const identificacion = `1061700${100 + i}`;
    
    // Distribución de contratos
    let tipoContrato, horasMaximas;
    if (i < 20) {
      tipoContrato = "TIEMPO_COMPLETO";
      horasMaximas = 40;
    } else if (i < 35) {
      tipoContrato = "MEDIO_TIEMPO";
      horasMaximas = 20;
    } else {
      tipoContrato = "CATEDRA";
      horasMaximas = 10;
    }

    // Especialidad basada en el residuo
    const especialidad = ESPECIALIDADES_DOCENTES[i % ESPECIALIDADES_DOCENTES.length];

    const usr = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        correo,
        contrasena: contrasenaDocenteHash,
        id_rol: rolDocente.id_rol
      }
    });

    const doc = await prisma.docente.create({
      data: {
        id_docente: usr.id_usuario,
        identificacion,
        telefono: `318${1000000 + i}`,
        horas_semanales_maximas: horasMaximas,
        tipo_contrato: tipoContrato
      }
    });

    // Guardar temporalmente en memoria para asignación
    docentesCreados.push({
      id_docente: doc.id_docente,
      nombres,
      apellidos,
      horasMaximas,
      especialidad,
      tipoContrato
    });
  }

  // 5. Creación de 3 Periodos Académicos
  console.log("Creando Periodos Académicos...");
  const periodo1 = await prisma.periodoAcademico.create({
    data: { nombre: "2026-1", fecha_inicio: new Date("2026-02-01"), fecha_fin: new Date("2026-06-20"), activo: false }
  });
  const periodo2 = await prisma.periodoAcademico.create({
    data: { nombre: "2026-2", fecha_inicio: new Date("2026-08-01"), fecha_fin: new Date("2026-12-15"), activo: true }
  });
  const periodo3 = await prisma.periodoAcademico.create({
    data: { nombre: "2027-1", fecha_inicio: new Date("2027-02-01"), fecha_fin: new Date("2027-06-20"), activo: false }
  });
  const periodos = [periodo1, periodo2, periodo3];

  // 6. Creación de 45 Salones Reales
  console.log("Creando 45 Salones...");
  const salonesCreados = [];
  
  // 25 Aulas de clase
  for (let s = 1; s <= 25; s++) {
    const sede = s <= 12 ? "Sede Centro" : "Sede Norte";
    const capacidad = s % 2 === 0 ? 40 : 35;
    const salon = await prisma.salon.create({
      data: {
        nombre: `Aula ${100 + s} (${sede})`,
        tipo: "AULA",
        capacidad,
        ubicacion: `Piso ${Math.ceil(s / 6)}`
      }
    });
    salonesCreados.push(salon);
  }

  // 5 Laboratorios de Software
  for (let s = 1; s <= 5; s++) {
    const salon = await prisma.salon.create({
      data: {
        nombre: `Laboratorio de Software ${s} (Sede Norte)`,
        tipo: "LABORATORIO_SOFTWARE",
        capacidad: 30,
        ubicacion: "Piso 2, Edificio de Tecnologías"
      }
    });
    salonesCreados.push(salon);
  }

  // 3 Laboratorios de Redes
  for (let s = 1; s <= 3; s++) {
    const salon = await prisma.salon.create({
      data: {
        nombre: `Laboratorio de Redes y Telecomunicaciones ${s} (Sede Norte)`,
        tipo: "LABORATORIO_REDES",
        capacidad: 25,
        ubicacion: "Piso 3, Bloque B"
      }
    });
    salonesCreados.push(salon);
  }

  // 3 Laboratorios de Electrónica
  for (let s = 1; s <= 3; s++) {
    const salon = await prisma.salon.create({
      data: {
        nombre: `Laboratorio de Electrónica y Circuitos ${s} (Sede Centro)`,
        tipo: "LABORATORIO_ELECTRONICA",
        capacidad: 25,
        ubicacion: "Piso 1, Bloque Técnico"
      }
    });
    salonesCreados.push(salon);
  }

  // 2 Laboratorios de Física
  for (let s = 1; s <= 2; s++) {
    const salon = await prisma.salon.create({
      data: {
        nombre: `Laboratorio de Física ${s} (Sede Centro)`,
        tipo: "LABORATORIO_FISICA",
        capacidad: 30,
        ubicacion: "Piso 1, Bloque A"
      }
    });
    salonesCreados.push(salon);
  }

  // 2 Auditorios
  salonesCreados.push(await prisma.salon.create({
    data: { nombre: "Auditorio Francisco José de Caldas (Sede Centro)", tipo: "AUDITORIO", capacidad: 150, ubicacion: "Piso 1" }
  }));
  salonesCreados.push(await prisma.salon.create({
    data: { nombre: "Auditorio Bicentenario (Sede Norte)", tipo: "AUDITORIO", capacidad: 120, ubicacion: "Piso 1" }
  }));

  // 5 Salas Multimedia
  for (let s = 1; s <= 5; s++) {
    const salon = await prisma.salon.create({
      data: {
        nombre: `Sala Multimedia ${400 + s} (Sede Centro)`,
        tipo: "SALA_MULTIMEDIA",
        capacidad: 30,
        ubicacion: "Piso 4"
      }
    });
    salonesCreados.push(salon);
  }

  // 7. Creación de 80 Materias
  console.log("Creando 80 Materias...");
  const materiasCreadas = [];
  for (const matDef of MATERIAS_DEFINICION) {
    const materia = await prisma.materia.create({
      data: {
        codigo: matDef.codigo,
        nombre: matDef.nombre,
        creditos: matDef.creditos,
        horas_semanales: matDef.horas
      }
    });
    // Recordar el área y tipo para asignación
    materiasCreadas.push({
      id_materia: materia.id_materia,
      codigo: matDef.codigo,
      nombre: matDef.nombre,
      horas: matDef.horas,
      tipo: matDef.tipo,
      area: matDef.area
    });
  }

  // 8. Creación de 25 Labores Académicas
  console.log("Creando 25 Labores...");
  const laboresCreadas = [];
  for (const labDef of LABORES_DEFINICION) {
    const labor = await prisma.labor.create({
      data: {
        nombre: labDef.nombre,
        descripcion: labDef.desc,
        horas_semanales: labDef.horas
      }
    });
    laboresCreadas.push(labor);
  }

  // 9. Algoritmo Inteligente de Generación de Horarios (Asignación libre de colisiones)
  console.log("Generando Horarios Universitarios libres de colisiones...");
  let totalHorariosCreados = 0;

  for (const periodo of periodos) {
    console.log(`Programando horarios para el periodo: ${periodo.nombre}...`);

    // Estructuras de control de colisión locales por Periodo
    const ocupacionDocente = {}; // docenteId -> dia -> bloque -> true/false
    const ocupacionSalon = {};   // salonId -> dia -> bloque -> true/false
    const ocupacionSemestre = {}; // semestreNumero (1..10) -> dia -> bloque -> true/false
    const horasDocenteAsignadas = {}; // docenteId -> totalHoras

    // Inicializar estructuras
    for (const d of docentesCreados) {
      ocupacionDocente[d.id_docente] = {};
      horasDocenteAsignadas[d.id_docente] = 0;
      for (const dia of DIAS_SEMANA) {
        ocupacionDocente[d.id_docente][dia] = {};
        for (const blq of BLOQUES_HORARIOS) {
          ocupacionDocente[d.id_docente][dia][blq.inicio] = false;
        }
      }
    }

    for (const s of salonesCreados) {
      ocupacionSalon[s.id_salon] = {};
      for (const dia of DIAS_SEMANA) {
        ocupacionSalon[s.id_salon][dia] = {};
        for (const blq of BLOQUES_HORARIOS) {
          ocupacionSalon[s.id_salon][dia][blq.inicio] = false;
        }
      }
    }

    for (let sem = 1; sem <= 10; sem++) {
      ocupacionSemestre[sem] = {};
      for (const dia of DIAS_SEMANA) {
        ocupacionSemestre[sem][dia] = {};
        for (const blq of BLOQUES_HORARIOS) {
          ocupacionSemestre[sem][dia][blq.inicio] = false;
        }
      }
    }

    // A. Programar Labores para Docentes de Tiempo Completo e Investigación
    // Cada docente TC recibe un par de labores que consumen parte de sus 40 horas
    const docentesTC = docentesCreados.filter(d => d.tipoContrato === "TIEMPO_COMPLETO");
    let indiceLabor = 0;
    
    for (const docTC of docentesTC) {
      // Tomamos 2 labores secuenciales
      const labor1 = laboresCreadas[indiceLabor % laboresCreadas.length];
      const labor2 = laboresCreadas[(indiceLabor + 1) % laboresCreadas.length];
      indiceLabor += 2;

      // Buscar bloque libre para Labor 1
      let asignadoL1 = false;
      for (const dia of DIAS_SEMANA) {
        if (asignadoL1) break;
        for (const blq of BLOQUES_HORARIOS) {
          if (!ocupacionDocente[docTC.id_docente][dia][blq.inicio]) {
            // Asignar Labor (No requiere salón específico, asignamos un Aula al azar o vacía)
            const salonAzar = salonesCreados[Math.floor(Math.random() * 25)]; // Aula de las primeras 25
            
            if (!ocupacionSalon[salonAzar.id_salon][dia][blq.inicio]) {
              await prisma.horario.create({
                data: {
                  id_periodo: periodo.id_periodo,
                  id_docente: docTC.id_docente,
                  id_salon: salonAzar.id_salon,
                  id_labor: labor1.id_labor,
                  dia_semana: dia,
                  hora_inicio: blq.inicio,
                  hora_fin: blq.fin
                }
              });

              ocupacionDocente[docTC.id_docente][dia][blq.inicio] = true;
              ocupacionSalon[salonAzar.id_salon][dia][blq.inicio] = true;
              horasDocenteAsignadas[docTC.id_docente] += 2; // Bloque de 2 horas
              totalHorariosCreados++;
              asignadoL1 = true;
              break;
            }
          }
        }
      }

      // Buscar bloque libre para Labor 2
      let asignadoL2 = false;
      for (const dia of DIAS_SEMANA) {
        if (asignadoL2) break;
        for (const blq of BLOQUES_HORARIOS) {
          if (!ocupacionDocente[docTC.id_docente][dia][blq.inicio]) {
            const salonAzar = salonesCreados[Math.floor(Math.random() * 25)];
            if (!ocupacionSalon[salonAzar.id_salon][dia][blq.inicio]) {
              await prisma.horario.create({
                data: {
                  id_periodo: periodo.id_periodo,
                  id_docente: docTC.id_docente,
                  id_salon: salonAzar.id_salon,
                  id_labor: labor2.id_labor,
                  dia_semana: dia,
                  hora_inicio: blq.inicio,
                  hora_fin: blq.fin
                }
              });

              ocupacionDocente[docTC.id_docente][dia][blq.inicio] = true;
              ocupacionSalon[salonAzar.id_salon][dia][blq.inicio] = true;
              horasDocenteAsignadas[docTC.id_docente] += 2;
              totalHorariosCreados++;
              asignadoL2 = true;
              break;
            }
          }
        }
      }
    }

    // B. Programar Materias Académicas
    // Por cada materia en Ingeniería Informática, programaremos 1 o 2 bloques de 2 horas según intensidad
    for (const mat of materiasCreadas) {
      // Determinar Semestre a partir del nombre (ej: "[Semestre III]" -> 3)
      const matches = mat.nombre.match(/Semestre\s(I|II|III|IV|V|VI|VII|VIII|IX|X)/);
      let semestreNum = 1;
      if (matches) {
        const roman = matches[1];
        const ROMANS = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10 };
        semestreNum = ROMANS[roman] || 1;
      }

      // Determinar cuántos bloques de 2 horas necesita (si es de 4 horas = 2 bloques, 2 horas = 1 bloque, 6 horas = 3 bloques)
      const bloquesNecesarios = Math.ceil(mat.horas / 2);

      // Buscar docentes con especialidad compatible
      const docentesCompatibles = docentesCreados.filter(d => d.especialidad === mat.area);
      if (docentesCompatibles.length === 0) continue;

      // Filtrar salones según tipo de materia
      let salonesFiltrados = [];
      if (mat.tipo === "PRACTICA" || mat.tipo === "MIXTA") {
        // Mapear área a laboratorio especializado
        if (mat.area === AREAS.REDES) {
          salonesFiltrados = salonesCreados.filter(s => s.tipo === "LABORATORIO_REDES");
        } else if (mat.area === AREAS.ELECTRONICA) {
          salonesFiltrados = salonesCreados.filter(s => s.tipo === "LABORATORIO_ELECTRONICA");
        } else if (mat.area === AREAS.CIENCIAS_BASICAS) {
          salonesFiltrados = salonesCreados.filter(s => s.tipo === "LABORATORIO_FISICA");
        } else {
          salonesFiltrados = salonesCreados.filter(s => s.tipo === "LABORATORIO_SOFTWARE");
        }
      }

      // Si no hay específicos o es teórica, usar Aulas o Salas Multimedia o Auditorios
      if (salonesFiltrados.length === 0) {
        salonesFiltrados = salonesCreados.filter(s => s.tipo === "AULA" || s.tipo === "SALA_MULTIMEDIA" || s.tipo === "AUDITORIO");
      }

      // Programar los bloques para esta materia
      let bloquesAsignados = 0;
      
      // Intentar asignar cada bloque
      for (let b = 0; b < bloquesNecesarios; b++) {
        let bloqueAsignadoExitosamente = false;

        // Barajar docentes compatibles para balancear
        const docentesBarajados = [...docentesCompatibles].sort(() => Math.random() - 0.5);

        for (const doc of docentesBarajados) {
          if (bloqueAsignadoExitosamente) break;

          // Verificar si el docente tiene capacidad de horas semanales disponible
          if (horasDocenteAsignadas[doc.id_docente] + 2 > doc.horasMaximas) {
            continue; // Excede su contrato
          }

          // Barajar salones compatibles
          const salonesBarajados = [...salonesFiltrados].sort(() => Math.random() - 0.5);

          for (const salon of salonesBarajados) {
            if (bloqueAsignadoExitosamente) break;

            // Buscar un slot libre de Lunes a Sábado
            for (const dia of DIAS_SEMANA) {
              if (bloqueAsignadoExitosamente) break;

              for (const blq of BLOQUES_HORARIOS) {
                // EVITAR CONFLICTOS/COLISIONES:
                // 1. Docente libre
                // 2. Salón libre
                // 3. Semestre libre (para que materias del mismo nivel no choquen)
                if (
                  !ocupacionDocente[doc.id_docente][dia][blq.inicio] &&
                  !ocupacionSalon[salon.id_salon][dia][blq.inicio] &&
                  !ocupacionSemestre[semestreNum][dia][blq.inicio]
                ) {
                  // Guardar en la base de datos
                  await prisma.horario.create({
                    data: {
                      id_periodo: periodo.id_periodo,
                      id_docente: doc.id_docente,
                      id_salon: salon.id_salon,
                      id_materia: mat.id_materia,
                      dia_semana: dia,
                      hora_inicio: blq.inicio,
                      hora_fin: blq.fin
                    }
                  });

                  // Registrar ocupación
                  ocupacionDocente[doc.id_docente][dia][blq.inicio] = true;
                  ocupacionSalon[salon.id_salon][dia][blq.inicio] = true;
                  ocupacionSemestre[semestreNum][dia][blq.inicio] = true;
                  horasDocenteAsignadas[doc.id_docente] += 2;
                  
                  bloqueAsignadoExitosamente = true;
                  bloquesAsignados++;
                  totalHorariosCreados++;
                  break;
                }
              }
            }
          }
        }
      }
    }
  }

  const countRoles = await prisma.rol.count();
  const countPermisos = await prisma.permiso.count();
  const countAdmins = await prisma.administrador.count();
  const countDocentes = await prisma.docente.count();
  const countUsuarios = await prisma.usuario.count();
  const countPeriodos = await prisma.periodoAcademico.count();
  const countSalones = await prisma.salon.count();
  const countMaterias = await prisma.materia.count();
  const countLabores = await prisma.labor.count();
  const countHorarios = await prisma.horario.count();

  console.log("=== RESUMEN DE EXECUCIÓN DEL SEED ===");
  console.log(`Roles creados: ${countRoles}`);
  console.log(`Permisos creados: ${countPermisos}`);
  console.log(`Usuarios en total: ${countUsuarios} (Admins: ${countAdmins}, Docentes: ${countDocentes})`);
  console.log(`Periodos Académicos creados: ${countPeriodos}`);
  console.log(`Salones/Espacios Académicos creados: ${countSalones}`);
  console.log(`Materias creadas: ${countMaterias}`);
  console.log(`Labores Académicas creadas: ${countLabores}`);
  console.log(`Total Horarios libres de colisión generados: ${countHorarios}`);
  console.log("Sembrado finalizado exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error crítico durante la ejecución del seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
