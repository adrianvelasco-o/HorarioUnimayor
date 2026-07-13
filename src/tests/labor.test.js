/**
 * Caso de uso implementado: UC-19 al UC-23 (Gestión de Labores)
 * Requisitos funcionales relacionados: RF5, RF10, RF18, RF23, RF28
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorLabor = require("../modulos/labor/controladorLabor").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Labores", () => {
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
        controladorLabor.servicioLabor.buscarPorNombre = jest.fn();
        controladorLabor.servicioLabor.buscarPorId = jest.fn();
        controladorLabor.servicioLabor.listarTodas = jest.fn();
        controladorLabor.servicioLabor.crearLabor = jest.fn();
        controladorLabor.servicioLabor.actualizarLabor = jest.fn();
        controladorLabor.servicioLabor.tieneHorariosAsociados = jest.fn();
        controladorLabor.servicioLabor.eliminarLabor = jest.fn();
    });

    describe("POST /api/labores", () => {
        test("Debe crear una labor con éxito si es Administrador", async () => {
            controladorLabor.servicioLabor.buscarPorNombre.mockResolvedValue(null);
            controladorLabor.servicioLabor.crearLabor.mockResolvedValue({
                id_labor: 1,
                nombre: "Investigación",
                descripcion: "Investigación de Software",
                horas_semanales: 10
            });

            const payload = {
                nombre: "Investigación",
                descripcion: "Investigación de Software",
                horas_semanales: 10
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/labores")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.labor.nombre).toBe("Investigación");
        });

        test("Debe rechazar la creación si las horas son menores o iguales a cero (RN-Labor-02)", async () => {
            const payload = {
                nombre: "Investigación",
                horas_semanales: 0 // Inválida
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/labores")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.errores[0].mensaje).toContain("positivo");
        });

        test("Debe denegar el acceso si el rol es Docente", async () => {
            const respuesta = await supertest(aplicacionExpress)
                .post("/api/labores")
                .set("Authorization", tokenDocente)
                .send({});

            expect(respuesta.statusCode).toBe(403);
        });
    });

    describe("DELETE /api/labores/:id", () => {
        test("Debe impedir la eliminación si tiene horarios vinculados (RN-Labor-03)", async () => {
            controladorLabor.servicioLabor.buscarPorId.mockResolvedValue({ id_labor: 1 });
            controladorLabor.servicioLabor.tieneHorariosAsociados.mockResolvedValue(true);

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/labores/1")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("cuenta con horarios asignados");
        });
    });
});
