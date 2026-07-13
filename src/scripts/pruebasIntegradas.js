const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function main() {
  console.log("=== INICIANDO PRUEBAS FUNCIONALES Y NEGATIVAS INTEGRALES (ISO 25010) ===");

  const resultados = [];
  function registrarResultado(id, caso, esperado, obtenido, estado) {
    resultados.push({ id, caso, esperado, obtenido, estado });
    if (estado === "PASADA") {
      console.log(`✅ [PASADA] ${id}: ${caso}`);
    } else {
      console.error(`❌ [FALLADA] ${id}: ${caso}. Esperado: ${esperado}. Obtenido: ${obtenido}`);
    }
  }

  // Utilidad para medir tiempos de respuesta
  async function medirPeticion(metodo, endpoint, datos = null, headers = {}) {
    const tInicio = Date.now();
    let res = null;
    let err = null;
    try {
      if (metodo === "GET") {
        res = await axios.get(`${BASE_URL}${endpoint}`, { headers });
      } else if (metodo === "POST") {
        res = await axios.post(`${BASE_URL}${endpoint}`, datos, { headers });
      } else if (metodo === "PUT") {
        res = await axios.put(`${BASE_URL}${endpoint}`, datos, { headers });
      } else if (metodo === "DELETE") {
        res = await axios.delete(`${BASE_URL}${endpoint}`, { headers });
      }
    } catch (e) {
      err = e;
    }
    const tFin = Date.now();
    return {
      tiempoMs: tFin - tInicio,
      status: res ? res.status : (err.response ? err.response.status : 500),
      data: res ? res.data : (err.response ? err.response.data : null),
      exitoso: !!res
    };
  }

  // ==========================================
  // FASE 2. Autenticación y Autorización (JWT)
  // ==========================================

  // 1. Iniciar sesión - Admin correcto
  const loginAdmin = await medirPeticion("POST", "/autenticacion/login", {
    correo: "admin1@unimayor.edu.co",
    contrasena: "Admin123*"
  });
  const tokenAdmin = loginAdmin.data?.tokenAcceso;
  registrarResultado(
    "TC-SEC-01",
    "Iniciar sesión como Administrador con credenciales válidas",
    "Status 200 y token JWT presente",
    `Status ${loginAdmin.status}${tokenAdmin ? " con token JWT" : " sin token"}`,
    loginAdmin.status === 200 && tokenAdmin ? "PASADA" : "FALLADA"
  );

  // 2. Iniciar sesión - Docente correcto
  const loginDocente = await medirPeticion("POST", "/autenticacion/login", {
    correo: "alejandro.gomez0@unimayor.edu.co",
    contrasena: "Docente123*"
  });
  const tokenDocente = loginDocente.data?.tokenAcceso;
  registrarResultado(
    "TC-SEC-02",
    "Iniciar sesión como Docente con credenciales válidas",
    "Status 200 y token JWT presente",
    `Status ${loginDocente.status}`,
    loginDocente.status === 200 && tokenDocente ? "PASADA" : "FALLADA"
  );

  // 3. Iniciar sesión - Contraseña incorrecta
  const loginClaveIncorrecta = await medirPeticion("POST", "/autenticacion/login", {
    correo: "admin1@unimayor.edu.co",
    contrasena: "ClaveInvalida123"
  });
  registrarResultado(
    "TC-SEC-03",
    "Iniciar sesión con contraseña incorrecta",
    "Status 401 (Credenciales inválidas)",
    `Status ${loginClaveIncorrecta.status}`,
    loginClaveIncorrecta.status === 401 ? "PASADA" : "FALLADA"
  );

  // 4. Iniciar sesión - Correo inexistente
  const loginCorreoInexistente = await medirPeticion("POST", "/autenticacion/login", {
    correo: "usuario.fantasma@unimayor.edu.co",
    contrasena: "Admin123*"
  });
  registrarResultado(
    "TC-SEC-04",
    "Iniciar sesión con correo inexistente",
    "Status 401 (Credenciales inválidas)",
    `Status ${loginCorreoInexistente.status}`,
    loginCorreoInexistente.status === 401 ? "PASADA" : "FALLADA"
  );

  // 5. Acceso sin autenticación (Rutas protegidas)
  const getSinToken = await medirPeticion("GET", "/docentes");
  registrarResultado(
    "TC-SEC-05",
    "Acceder a endpoint protegido sin token JWT",
    "Status 401 (No autorizado)",
    `Status ${getSinToken.status}`,
    getSinToken.status === 401 ? "PASADA" : "FALLADA"
  );

  // 6. Escalada de privilegios (Rol Docente intentando crear un docente)
  const headersDocente = { Authorization: `Bearer ${tokenDocente}` };
  const postConDocente = await medirPeticion("POST", "/docentes", {
    nombres: "Docente",
    apellidos: "Prueba",
    correo: "docente.prueba.rbac@unimayor.edu.co",
    contrasena: "Docente123*",
    identificacion: "999888777",
    telefono: "3000000000",
    horas_semanales_maximas: 20,
    tipo_contrato: "MEDIO_TIEMPO"
  }, headersDocente);
  registrarResultado(
    "TC-SEC-06",
    "Docente intenta crear un docente (RBAC)",
    "Status 403 (Acceso denegado)",
    `Status ${postConDocente.status}`,
    postConDocente.status === 403 ? "PASADA" : "FALLADA"
  );

  // 7. Token manipulado
  const getConTokenManipulado = await medirPeticion("GET", "/docentes", null, {
    Authorization: "Bearer token_falso_y_manipulado"
  });
  registrarResultado(
    "TC-SEC-07",
    "Acceso con token JWT manipulado",
    "Status 401 (Token inválido)",
    `Status ${getConTokenManipulado.status}`,
    getConTokenManipulado.status === 401 ? "PASADA" : "FALLADA"
  );

  // ==========================================
  // FASE 3. CRUDs y Reglas de Negocio
  // ==========================================
  const headersAdmin = { Authorization: `Bearer ${tokenAdmin}` };

  // --- CRUD Docentes ---
  const docIdent = "999111222";
  const postDocente = await medirPeticion("POST", "/docentes", {
    nombres: "Ginna",
    apellidos: "Calvache",
    correo: "ginna.calvache.prueba@unimayor.edu.co",
    contrasena: "Docente123*",
    identificacion: docIdent,
    telefono: "3189990000",
    horas_semanales_maximas: 20,
    tipo_contrato: "MEDIO_TIEMPO"
  }, headersAdmin);
  const docId = postDocente.data?.usuario?.id_usuario;
  registrarResultado(
    "TC-CRUD-01",
    "Crear docente como Administrador",
    "Status 201 y objeto docente retornado",
    `Status ${postDocente.status}`,
    postDocente.status === 201 && docId ? "PASADA" : "FALLADA"
  );

  // Negativa: Identificación docente duplicada
  const postDocenteDuplicado = await medirPeticion("POST", "/docentes", {
    nombres: "Ginna Duplicada",
    apellidos: "Calvache",
    correo: "ginna.duplicada@unimayor.edu.co",
    contrasena: "Docente123*",
    identificacion: docIdent, // ID Duplicado
    telefono: "3189990000",
    horas_semanales_maximas: 20,
    tipo_contrato: "MEDIO_TIEMPO"
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-01",
    "Crear docente con identificación ya registrada",
    "Status 400 (Identificación ya existe)",
    `Status ${postDocenteDuplicado.status}`,
    postDocenteDuplicado.status === 400 ? "PASADA" : "FALLADA"
  );

  // Negativa: Correo usuario duplicado
  const postUsuarioCorreoDuplicado = await medirPeticion("POST", "/docentes", {
    nombres: "Ginna Nueva",
    apellidos: "Calvache",
    correo: "ginna.calvache.prueba@unimayor.edu.co", // Correo Duplicado
    contrasena: "Docente123*",
    identificacion: "888222333",
    telefono: "3189990000",
    horas_semanales_maximas: 20,
    tipo_contrato: "MEDIO_TIEMPO"
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-02",
    "Crear usuario con correo ya registrado",
    "Status 409 (Correo ya registrado)",
    `Status ${postUsuarioCorreoDuplicado.status}`,
    postUsuarioCorreoDuplicado.status === 409 ? "PASADA" : "FALLADA"
  );

  // --- CRUD Materias ---
  const matCodigo = "INF-TEST";
  const postMateria = await medirPeticion("POST", "/materias", {
    codigo: matCodigo,
    nombre: "Pruebas de Calidad de Software",
    creditos: 3,
    horas_semanales: 4
  }, headersAdmin);
  const matId = postMateria.data?.materia?.id_materia;
  registrarResultado(
    "TC-CRUD-02",
    "Crear materia como Administrador",
    "Status 201 y materia creada",
    `Status ${postMateria.status}`,
    postMateria.status === 201 && matId ? "PASADA" : "FALLADA"
  );

  // Negativa: Código materia duplicado
  const postMateriaDuplicada = await medirPeticion("POST", "/materias", {
    codigo: matCodigo, // Código Duplicado
    nombre: "Pruebas de Software Duplicada",
    creditos: 3,
    horas_semanales: 4
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-03",
    "Crear materia con código ya existente",
    "Status 400 (Código ya existe)",
    `Status ${postMateriaDuplicada.status}`,
    postMateriaDuplicada.status === 400 ? "PASADA" : "FALLADA"
  );

  // --- CRUD Salones ---
  const salonNombre = "Laboratorio de Pruebas de Calidad";
  const postSalon = await medirPeticion("POST", "/salones", {
    nombre: salonNombre,
    tipo: "LABORATORIO_SOFTWARE",
    capacidad: 30,
    ubicacion: "Piso 3"
  }, headersAdmin);
  const salonId = postSalon.data?.salon?.id_salon;
  registrarResultado(
    "TC-CRUD-03",
    "Crear salón como Administrador",
    "Status 201 y salón creado",
    `Status ${postSalon.status}`,
    postSalon.status === 201 && salonId ? "PASADA" : "FALLADA"
  );

  // Negativa: Nombre salón duplicado
  const postSalonDuplicado = await medirPeticion("POST", "/salones", {
    nombre: salonNombre, // Nombre Duplicado
    tipo: "LABORATORIO_SOFTWARE",
    capacidad: 30,
    ubicacion: "Piso 3"
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-04",
    "Crear salón con nombre ya existente",
    "Status 400 (Nombre ya existe)",
    `Status ${postSalonDuplicado.status}`,
    postSalonDuplicado.status === 400 ? "PASADA" : "FALLADA"
  );

  // --- CRUD Periodos ---
  const postPeriodo = await medirPeticion("POST", "/periodos", {
    nombre: "2027-2",
    fecha_inicio: "2027-08-01",
    fecha_fin: "2027-12-15"
  }, headersAdmin);
  const periodoId = postPeriodo.data?.periodo?.id_periodo;
  registrarResultado(
    "TC-CRUD-04",
    "Crear periodo académico como Administrador",
    "Status 201 y periodo creado",
    `Status ${postPeriodo.status}`,
    postPeriodo.status === 201 && periodoId ? "PASADA" : "FALLADA"
  );

  // ==========================================
  // FASE 4. Reglas de Negocio en Horarios (Negativas)
  // ==========================================

  // Cargar datos reales para forzar colisiones
  const periodosGet = await medirPeticion("GET", "/periodos", null, headersAdmin);
  const periodoActivo = periodosGet.data.find(p => p.nombre === "2026-2");
  const pid = periodoActivo.id_periodo;

  const docentesGet = await medirPeticion("GET", "/docentes", null, headersAdmin);
  const docenteAsig = docentesGet.data[0]; // Primer docente (ej. Alejandro Gómez)
  const did = docenteAsig.id_docente;

  const salonesGet = await medirPeticion("GET", "/salones", null, headersAdmin);
  const salonAsig = salonesGet.data[0]; // Primer salón
  const sid = salonAsig.id_salon;

  const materiasGet = await medirPeticion("GET", "/materias", null, headersAdmin);
  const materiaAsig = materiasGet.data[0]; // Primera materia
  const mid = materiaAsig.id_materia;

  // 1. Crear primer horario base
  const postHorarioBase = await medirPeticion("POST", "/horarios", {
    id_periodo: pid,
    id_docente: did,
    id_salon: sid,
    id_materia: mid,
    dia_semana: "LUNES",
    hora_inicio: "07:00",
    hora_fin: "09:00"
  }, headersAdmin);

  // 2. Intentar crear colisión: Docente ocupado
  const postHorarioChoqueDocente = await medirPeticion("POST", "/horarios", {
    id_periodo: pid,
    id_docente: did, // Mismo docente
    id_salon: salonesGet.data[1].id_salon, // Diferente salón
    id_materia: materiasGet.data[1].id_materia,
    dia_semana: "LUNES",
    hora_inicio: "07:00",
    hora_fin: "09:00"
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-05",
    "Asignar horario a docente ocupado en el mismo bloque",
    "Status 400 (Choque de docente)",
    `Status ${postHorarioChoqueDocente.status}. Respuesta: ${JSON.stringify(postHorarioChoqueDocente.data)}`,
    postHorarioChoqueDocente.status === 400 ? "PASADA" : "FALLADA"
  );

  // 3. Intentar crear colisión: Salón ocupado
  const postHorarioChoqueSalon = await medirPeticion("POST", "/horarios", {
    id_periodo: pid,
    id_docente: docentesGet.data[1].id_docente, // Diferente docente
    id_salon: sid, // Mismo salón
    id_materia: materiasGet.data[1].id_materia,
    dia_semana: "LUNES",
    hora_inicio: "07:00",
    hora_fin: "09:00"
  }, headersAdmin);
  registrarResultado(
    "TC-NEG-06",
    "Asignar horario a salón ocupado en el mismo bloque",
    "Status 400 (Choque de salón)",
    `Status ${postHorarioChoqueSalon.status}. Respuesta: ${JSON.stringify(postHorarioChoqueSalon.data)}`,
    postHorarioChoqueSalon.status === 400 ? "PASADA" : "FALLADA"
  );

  // ==========================================
  // Limpieza de registros creados en las pruebas
  // ==========================================
  console.log("Limpiando registros de prueba creados...");
  if (postHorarioBase.data?.horario?.id_horario) {
    await medirPeticion("DELETE", `/horarios/${postHorarioBase.data.horario.id_horario}`, null, headersAdmin);
  }
  if (docId) {
    await medirPeticion("DELETE", `/docentes/${docId}`, null, headersAdmin);
  }
  if (matId) {
    await medirPeticion("DELETE", `/materias/${matId}`, null, headersAdmin);
  }
  if (salonId) {
    await medirPeticion("DELETE", `/salones/${salonId}`, null, headersAdmin);
  }
  if (periodoId) {
    await medirPeticion("DELETE", `/periodos/${periodoId}`, null, headersAdmin);
  }

  // Output compliance metrics
  console.log("\n=== COMPLIANCE RESULTS ===");
  console.log(`Pruebas ejecutadas: ${resultados.length}`);
  console.log(`PASADAS: ${resultados.filter(r => r.estado === "PASADA").length}`);
  console.log(`FALLADAS: ${resultados.filter(r => r.estado === "FALLADA").length}`);
}

main().catch(console.error);
