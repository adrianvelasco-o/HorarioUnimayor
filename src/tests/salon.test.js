/**
 * Caso de uso implementado: UC-14 al UC-18 (Gestión de Ambientes/Salones)
 * Requisitos funcionales relacionados: RF4, RF9, RF17, RF21, RF26
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorSalon = require("../modulos/salon/controladorSalon").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Salones/Ambientes", () => {
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
        controladorSalon.servicioSalon.buscarPorNombre = jest.fn();
        controladorSalon.servicioSalon.buscarPorId = jest.fn();
        controladorSalon.servicioSalon.listarTodos = jest.fn();
        controladorSalon.servicioSalon.crearSalon = jest.fn();
        controladorSalon.servicioSalon.actualizarSalon = jest.fn();
        controladorSalon.servicioSalon.tieneHorariosVinculados = jest.fn();
        controladorSalon.servicioSalon.eliminarSalon = jest.fn();
    });

    describe("POST /api/salones", () => {
        test("Debe crear un salón con éxito si es Administrador", async () => {
            controladorSalon.servicioSalon.buscarPorNombre.mockResolvedValue(null);
            controladorSalon.servicioSalon.crearSalon.mockResolvedValue({
                id_salon: 1,
                nombre: "Aula 301",
                tipo: "AULA",
                capacidad: 30,
                ubicacion: "Bloque A"
            });

            const payload = {
                nombre: "Aula 301",
                tipo: "AULA",
                capacidad: 30,
                ubicacion: "Bloque A"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/salones")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.salon.nombre).toBe("Aula 301");
        });

        test("Debe rechazar la creación si la capacidad es menor o igual a cero (RN-Salon-02)", async () => {
            const payload = {
                nombre: "Aula 301",
                tipo: "AULA",
                capacidad: 0 // Inválida
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/salones")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.errores[0].mensaje).toContain("positivo");
        });

        test("Debe denegar el acceso si el rol es Docente (RBAC)", async () => {
            const respuesta = await supertest(aplicacionExpress)
                .post("/api/salones")
                .set("Authorization", tokenDocente)
                .send({});

            expect(respuesta.statusCode).toBe(403);
        });
    });

    describe("DELETE /api/salones/:id", () => {
        test("Debe impedir el borrado si tiene horarios asociados (RN-Salon-03)", async () => {
            controladorSalon.servicioSalon.buscarPorId.mockResolvedValue({ id_salon: 1 });
            controladorSalon.servicioSalon.tieneHorariosVinculados.mockResolvedValue(true);

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/salones/1")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("cuenta con horarios asignados");
        });
    });
});
