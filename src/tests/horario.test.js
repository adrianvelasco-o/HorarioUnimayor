/**
 * Caso de uso implementado: UC-24 al UC-29 (Gestión de Horarios)
 * Requisitos funcionales relacionados: RF7, RF13
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const FachadaHorario = require("../modulos/horario/fachadaHorario").obtenerInstancia();
const controladorHorario = require("../modulos/horario/controladorHorario").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Horarios y Fachada", () => {
    let tokenAdministrador;
    let tokenDocente;

    beforeAll(() => {
        tokenAdministrador = "Bearer " + jwt.sign(
            { id_usuario: 1, nombres: "Admin", rol: "ADMINISTRADOR" },
            configuracionApp.jwtClaveSecreta
        );
        tokenDocente = "Bearer " + jwt.sign(
            { id_usuario: 2, nombres: "Docente", rol: "DOCENTE" },
            configuracionApp.jwtClaveSecreta
        );
    });

    beforeEach(() => {
        FachadaHorario.servicioPeriodo.buscarPorId = jest.fn();
        FachadaHorario.servicioDocente.buscarPorId = jest.fn();
        FachadaHorario.servicioSalon.buscarPorId = jest.fn();
        FachadaHorario.servicioHorario.buscarHorariosDocentePorDia = jest.fn();
        FachadaHorario.servicioHorario.buscarHorariosSalonPorDia = jest.fn();
        FachadaHorario.servicioHorario.obtenerHorasProgramadasDocente = jest.fn();
        FachadaHorario.servicioHorario.crearHorario = jest.fn();
        FachadaHorario.servicioHorario.listarPorPeriodo = jest.fn();
        FachadaHorario.servicioHorario.buscarPorId = jest.fn();
        FachadaHorario.servicioHorario.eliminarHorario = jest.fn();

        // Mockear también el servicio del controlador para evitar conexión a base de datos
        controladorHorario.servicioHorario.listarPorPeriodo = jest.fn();
        controladorHorario.servicioHorario.buscarPorId = jest.fn();
        controladorHorario.servicioHorario.eliminarHorario = jest.fn();
    });

    describe("POST /api/horarios", () => {
        test("Debe programar un horario de forma exitosa si no hay colisiones (Facade)", async () => {
            FachadaHorario.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1 });
            FachadaHorario.servicioDocente.buscarPorId.mockResolvedValue({ id_docente: 3, horas_semanales_maximas: 40 });
            FachadaHorario.servicioSalon.buscarPorId.mockResolvedValue({ id_salon: 1, nombre: "Aula 301" });

            FachadaHorario.servicioHorario.buscarHorariosDocentePorDia.mockResolvedValue([]); // Sin colisiones
            FachadaHorario.servicioHorario.buscarHorariosSalonPorDia.mockResolvedValue([]);
            FachadaHorario.servicioHorario.obtenerHorasProgramadasDocente.mockResolvedValue(0);

            FachadaHorario.servicioHorario.crearHorario.mockResolvedValue({
                id_horario: 1,
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "07:00",
                hora_fin: "09:00"
            });

            // Mock manual de Prisma para evitar dependencias cruzadas en el test
            const baseDatos = require("../configuracion/baseDatos").obtenerClientePrisma();
            baseDatos.materia = { findUnique: jest.fn().mockResolvedValue({ id_materia: 5, horas_semanales: 4 }) };

            const payload = {
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "07:00",
                hora_fin: "09:00"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.horario.id_horario).toBe(1);
        });

        test("Debe rechazar la programación si la hora de inicio es igual o posterior a la de fin (RN-Horario-04)", async () => {
            const payload = {
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "09:00", // Posterior
                hora_fin: "07:00"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.mensaje).toContain("anterior a la hora de fin");
        });

        test("Debe rechazar la programación si hay solapamiento del docente (RN-Horario-01)", async () => {
            FachadaHorario.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1 });
            FachadaHorario.servicioDocente.buscarPorId.mockResolvedValue({ id_docente: 3, horas_semanales_maximas: 40 });
            FachadaHorario.servicioSalon.buscarPorId.mockResolvedValue({ id_salon: 1, nombre: "Aula 301" });

            // Docente ocupado de 08:00 a 10:00
            FachadaHorario.servicioHorario.buscarHorariosDocentePorDia.mockResolvedValue([
                { hora_inicio: "08:00", hora_fin: "10:00" }
            ]);

            const payload = {
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "07:00", // Solapa con 08:00
                hora_fin: "09:00"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.mensaje).toContain("Colisión de horarios: El docente ya tiene asignada");
        });

        test("Debe rechazar la programación si hay solapamiento de salón/ambiente (RN-Horario-02)", async () => {
            FachadaHorario.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1 });
            FachadaHorario.servicioDocente.buscarPorId.mockResolvedValue({ id_docente: 3, horas_semanales_maximas: 40 });
            FachadaHorario.servicioSalon.buscarPorId.mockResolvedValue({ id_salon: 1, nombre: "Aula 301" });

            FachadaHorario.servicioHorario.buscarHorariosDocentePorDia.mockResolvedValue([]);
            // Salón ocupado de 07:30 a 09:30
            FachadaHorario.servicioHorario.buscarHorariosSalonPorDia.mockResolvedValue([
                { hora_inicio: "07:30", hora_fin: "09:30" }
            ]);

            const payload = {
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "07:00", // Solapa
                hora_fin: "09:00"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.mensaje).toContain("Colisión de ambientes: El salón 'Aula 301' ya está ocupado");
        });

        test("Debe rechazar la programación si supera el límite de horas semanales del docente (RN-Horario-03)", async () => {
            FachadaHorario.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1 });
            FachadaHorario.servicioDocente.buscarPorId.mockResolvedValue({ id_docente: 3, horas_semanales_maximas: 10 }); // Límite bajo
            FachadaHorario.servicioSalon.buscarPorId.mockResolvedValue({ id_salon: 1, nombre: "Aula 301" });

            FachadaHorario.servicioHorario.buscarHorariosDocentePorDia.mockResolvedValue([]);
            FachadaHorario.servicioHorario.buscarHorariosSalonPorDia.mockResolvedValue([]);
            FachadaHorario.servicioHorario.obtenerHorasProgramadasDocente.mockResolvedValue(8); // Ya tiene 8 programadas

            const baseDatos = require("../configuracion/baseDatos").obtenerClientePrisma();
            baseDatos.materia = { findUnique: jest.fn().mockResolvedValue({ id_materia: 5, horas_semanales: 4 }) }; // Suma 4 -> total 12 > 10

            const payload = {
                id_periodo: 1,
                id_docente: 3,
                id_salon: 1,
                id_materia: 5,
                dia_semana: "LUNES",
                hora_inicio: "07:00",
                hora_fin: "09:00"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.mensaje).toContain("Límite excedido: El docente no puede superar");
        });

        test("Debe permitir lectura de horarios al Docente (UC-29)", async () => {
            FachadaHorario.servicioHorario.listarPorPeriodo.mockResolvedValue([]);

            const respuesta = await supertest(aplicacionExpress)
                .get("/api/horarios?id_periodo=1")
                .set("Authorization", tokenDocente);

            expect(respuesta.statusCode).toBe(200);
            expect(respuesta.body.exitoso).toBe(true);
        });

        test("Debe denegar creación de horarios al Docente (RBAC - QS-1)", async () => {
            const respuesta = await supertest(aplicacionExpress)
                .post("/api/horarios")
                .set("Authorization", tokenDocente)
                .send({});

            expect(respuesta.statusCode).toBe(403);
        });
    });
});
