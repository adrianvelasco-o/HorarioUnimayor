/**
 * Caso de uso implementado: UC-30 al UC-34 (Gestión de Materias)
 * Requisitos funcionales relacionados: RF8, RF14, RF19, RF24, RF29
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorMateria = require("../modulos/materia/controladorMateria").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Materias", () => {
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
        controladorMateria.servicioMateria.buscarPorCodigo = jest.fn();
        controladorMateria.servicioMateria.buscarPorNombre = jest.fn();
        controladorMateria.servicioMateria.buscarPorId = jest.fn();
        controladorMateria.servicioMateria.listarTodas = jest.fn();
        controladorMateria.servicioMateria.crearMateria = jest.fn();
        controladorMateria.servicioMateria.actualizarMateria = jest.fn();
        controladorMateria.servicioMateria.tieneHorariosAsociados = jest.fn();
        controladorMateria.servicioMateria.eliminarMateria = jest.fn();
    });

    describe("POST /api/materias", () => {
        test("Debe crear una materia con éxito si es Administrador", async () => {
            controladorMateria.servicioMateria.buscarPorCodigo.mockResolvedValue(null);
            controladorMateria.servicioMateria.buscarPorNombre.mockResolvedValue(null);
            controladorMateria.servicioMateria.crearMateria.mockResolvedValue({
                id_materia: 1,
                codigo: "ISOF401",
                nombre: "Arquitectura de Software",
                creditos: 3,
                horas_semanales: 4
            });

            const payload = {
                codigo: "ISOF401",
                nombre: "Arquitectura de Software",
                creditos: 3,
                horas_semanales: 4
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/materias")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.materia.nombre).toBe("Arquitectura de Software");
        });

        test("Debe rechazar la creación si los créditos son menores o iguales a cero (RN-Materia-03)", async () => {
            const payload = {
                codigo: "ISOF401",
                nombre: "Arquitectura de Software",
                creditos: 0, // Inválida
                horas_semanales: 4
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/materias")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.errores[0].mensaje).toContain("positivo");
        });

        test("Debe denegar la creación si el código ya existe (RN-Materia-01)", async () => {
            controladorMateria.servicioMateria.buscarPorCodigo.mockResolvedValue({ id_materia: 1, codigo: "ISOF401" });

            const payload = {
                codigo: "ISOF401",
                nombre: "Arquitectura de Software",
                creditos: 3,
                horas_semanales: 4
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/materias")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("ya se encuentra registrado");
        });
    });

    describe("DELETE /api/materias/:id", () => {
        test("Debe impedir el borrado si tiene horarios vinculados (RN-Materia-04)", async () => {
            controladorMateria.servicioMateria.buscarPorId.mockResolvedValue({ id_materia: 1 });
            controladorMateria.servicioMateria.tieneHorariosAsociados.mockResolvedValue(true);

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/materias/1")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("cuenta con horarios asignados");
        });
    });
});
