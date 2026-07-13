/**
 * Caso de uso implementado: UC-4 al UC-8 (Gestión de Docentes)
 * Requisitos funcionales relacionados: RF6, RF12, RF16, RF22, RF27
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorDocente = require("../modulos/docente/controladorDocente").obtenerInstancia();
const jwt = require("jsonwebtoken");
const configuracionApp = require("../configuracion/entorno").obtenerInstancia();

describe("Pruebas unitarias para el Módulo de Docentes", () => {
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
        controladorDocente.servicioDocente.buscarPorId = jest.fn();
        controladorDocente.servicioDocente.buscarPorIdentificacion = jest.fn();
        controladorDocente.servicioDocente.listarTodos = jest.fn();
        controladorDocente.servicioDocente.crearDocente = jest.fn();
        controladorDocente.servicioDocente.actualizarDocente = jest.fn();
        controladorDocente.servicioDocente.tieneHorariosAsociados = jest.fn();
        controladorDocente.servicioDocente.eliminarDocente = jest.fn();
    });

    describe("POST /api/docentes", () => {
        test("Debe crear un docente de forma atómica si es Administrador", async () => {
            controladorDocente.servicioDocente.buscarPorIdentificacion.mockResolvedValue(null);
            controladorDocente.servicioDocente.crearDocente.mockResolvedValue({
                id_docente: 3,
                identificacion: "1061700",
                horas_semanales_maximas: 40,
                tipo_contrato: "TIEMPO_COMPLETO",
                usuario: {
                    nombres: "Ginna",
                    apellidos: "Puliche",
                    correo: "ginna@unimayor.edu.co"
                }
            });

            const payload = {
                nombres: "Ginna",
                apellidos: "Puliche",
                correo: "ginna@unimayor.edu.co",
                contrasena: "docenteContra123",
                id_rol: 2,
                identificacion: "1061700",
                telefono: "3120000",
                horas_semanales_maximas: 40,
                tipo_contrato: "TIEMPO_COMPLETO"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/docentes")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.docente.usuario.correo).toBe("ginna@unimayor.edu.co");
        });

        test("Debe rechazar la creación si la identificación ya existe", async () => {
            controladorDocente.servicioDocente.buscarPorIdentificacion.mockResolvedValue({ id_docente: 3 });

            const payload = {
                nombres: "Ginna",
                apellidos: "Puliche",
                correo: "ginna@unimayor.edu.co",
                contrasena: "docenteContra123",
                id_rol: 2,
                identificacion: "1061700",
                telefono: "3120000",
                horas_semanales_maximas: 40,
                tipo_contrato: "TIEMPO_COMPLETO"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/docentes")
                .set("Authorization", tokenAdministrador)
                .send(payload);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("ya está registrada");
        });

        test("Debe rechazar la creación si el rol del que realiza es Docente", async () => {
            const respuesta = await supertest(aplicacionExpress)
                .post("/api/docentes")
                .set("Authorization", tokenDocente)
                .send({});

            expect(respuesta.statusCode).toBe(403);
        });
    });

    describe("DELETE /api/docentes/:id", () => {
        test("Debe denegar el borrado si cuenta con horarios programados", async () => {
            controladorDocente.servicioDocente.buscarPorId.mockResolvedValue({ id_docente: 3 });
            controladorDocente.servicioDocente.tieneHorariosAsociados.mockResolvedValue(true);

            const respuesta = await supertest(aplicacionExpress)
                .delete("/api/docentes/3")
                .set("Authorization", tokenAdministrador);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.mensaje).toContain("cuenta con horarios asignados");
        });
    });
});
