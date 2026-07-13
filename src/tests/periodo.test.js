/**
 * Caso de uso implementado: UC-9 al UC-13 (Gestión de Periodos Académicos)
 * Requisitos funcionales relacionados: RF3, RF11, RF15, RF20, RF25
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorPeriodo = require("../modulos/periodo/controladorPeriodo").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Periodos Académicos", () => {
    let tokenAdministrador;
    let tokenDocente;

    beforeAll(() => {
        // Generar tokens para autenticación en las rutas protegidas
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
        controladorPeriodo.servicioPeriodo.buscarPorNombre = jest.fn();
        controladorPeriodo.servicioPeriodo.buscarPorId = jest.fn();
        controladorPeriodo.servicioPeriodo.listarTodos = jest.fn();
        controladorPeriodo.servicioPeriodo.crearPeriodo = jest.fn();
        controladorPeriodo.servicioPeriodo.actualizarPeriodo = jest.fn();
        controladorPeriodo.servicioPeriodo.tieneHorariosVinculados = jest.fn();
        controladorPeriodo.servicioPeriodo.eliminarPeriodo = jest.fn();
    });

    describe("POST /api/periodos", () => {
        test("Debe crear un periodo académico con éxito si es Administrador", async () => {
            controladorPeriodo.servicioPeriodo.buscarPorNombre.mockResolvedValue(null);
            controladorPeriodo.servicioPeriodo.crearPeriodo.mockResolvedValue({
                id_periodo: 1,
                nombre: "2026-1",
                fecha_inicio: new Date("2026-02-01"),
                fecha_fin: new Date("2026-06-20"),
                activo: true
            });

            const payload = {
                nombre: "2026-1",
                fecha_inicio: "2026-02-01",
                fecha_fin: "2026-06-20"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/periodos")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.periodo.nombre).toBe("2026-1");
        });

        test("Debe rechazar la creación si el rol es Docente (Restricción de Seguridad RBAC)", async () => {
            const payload = {
                nombre: "2026-1",
                fecha_inicio: "2026-02-01",
                fecha_fin: "2026-06-20"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/periodos")
                .set("Authorization", tokenDocente)
                .send(payload);

            expect(respuesta.statusCode).toBe(403);
            expect(respuesta.body.exitoso).toBe(false);
            expect(respuesta.body.mensaje).toContain("Su rol institucional no tiene permisos");
        });

        test("Debe fallar si la fecha de inicio es posterior a la de fin (RN-Periodo-02)", async () => {
            const payload = {
                nombre: "2026-1",
                fecha_inicio: "2026-06-20", // Posterior
                fecha_fin: "2026-02-01"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/periodos")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.exitoso).toBe(false);
            expect(respuesta.body.mensaje).toContain("anterior a la fecha de fin");
        });

        test("Debe rechazar si el nombre del periodo ya existe (RN-Periodo-01)", async () => {
            controladorPeriodo.servicioPeriodo.buscarPorNombre.mockResolvedValue({ id_periodo: 1, nombre: "2026-1" });

            const payload = {
                nombre: "2026-1",
                fecha_inicio: "2026-02-01",
                fecha_fin: "2026-06-20"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/periodos")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("ya se encuentra registrado");
        });
    });

    describe("DELETE /api/periodos/:id", () => {
        test("Debe rechazar la eliminación si el periodo tiene horarios vinculados (RN-Periodo-03)", async () => {
            controladorPeriodo.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1, nombre: "2026-1" });
            controladorPeriodo.servicioPeriodo.tieneHorariosVinculados.mockResolvedValue(true); // Tiene horarios

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/periodos/1")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("cuenta con horarios asignados");
        });

        test("Debe permitir la eliminación si no tiene horarios", async () => {
            controladorPeriodo.servicioPeriodo.buscarPorId.mockResolvedValue({ id_periodo: 1, nombre: "2026-1" });
            controladorPeriodo.servicioPeriodo.tieneHorariosVinculados.mockResolvedValue(false);
            controladorPeriodo.servicioPeriodo.eliminarPeriodo.mockResolvedValue({ id_periodo: 1 });

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/periodos/1")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(200);
            expect(respuesta.body.exitoso).toBe(true);
        });
    });
});
