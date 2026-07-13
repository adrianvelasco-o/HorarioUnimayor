/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2
 * Escenarios QAW relacionados: QS-1 (Seguridad)
 * Componentes C4 involucrados: Tests Unitarios / Jest
 */

const supertest = require("supertest");
const aplicacionExpress = require("../configuracion/servidor");
const controladorAutenticacion = require("../modulos/autenticacion/controladorAutenticacion").obtenerInstancia();
const bcrypt = require("bcrypt");

describe("Pruebas unitarias para el Módulo de Autenticación y Registro", () => {
    beforeEach(() => {
        // Inyectar espías Jest directamente en la propiedad del servicio del controlador Singleton
        controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo = jest.fn();
        controladorAutenticacion.servicioAutenticacion.buscarRolPorId = jest.fn();
        controladorAutenticacion.servicioAutenticacion.guardarNuevoUsuario = jest.fn();

        // Limpiar el mapa de intentos fallidos para cada prueba aislada
        controladorAutenticacion.registroIntentosFallidos.clear();
    });

    describe("POST /api/autenticacion/registro", () => {
        test("Debe registrar un nuevo usuario con éxito cuando los datos son válidos", async () => {
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue(null);
            controladorAutenticacion.servicioAutenticacion.buscarRolPorId.mockResolvedValue({ id_rol: 1, nombre: "ADMINISTRADOR" });
            controladorAutenticacion.servicioAutenticacion.guardarNuevoUsuario.mockResolvedValue({
                id_usuario: 1,
                nombres: "Adrian",
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                id_rol: 1
            });

            const payloadRegistro = {
                nombres: "Adrian",
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                contrasena: "contrasenaSegura123",
                id_rol: 1
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/autenticacion/registro")
                .send(payloadRegistro);

            expect(respuesta.statusCode).toBe(201);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.usuario.correo).toBe("adrian@unimayor.edu.co");
        });

        test("Debe rechazar el registro si el correo electrónico ya existe", async () => {
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue({ id_usuario: 1, correo: "adrian@unimayor.edu.co" });

            const payloadRegistro = {
                nombres: "Adrian",
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                contrasena: "contrasenaSegura123",
                id_rol: 1
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/autenticacion/registro")
                .send(payloadRegistro);

            expect(respuesta.statusCode).toBe(409);
            expect(respuesta.body.exitoso).toBe(false);
            expect(respuesta.body.mensaje).toContain("ya se encuentra registrado");
        });

        test("Debe fallar si los nombres son demasiado cortos (RN-Campos-Obligatorios)", async () => {
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue(null);
            controladorAutenticacion.servicioAutenticacion.buscarRolPorId.mockResolvedValue({ id_rol: 1, nombre: "ADMINISTRADOR" });

            const payloadRegistro = {
                nombres: "Ad", // Menor a 3 caracteres (RN-Campos-Obligatorios nombres > 2)
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                contrasena: "contrasenaSegura123",
                id_rol: 1
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/autenticacion/registro")
                .send(payloadRegistro);

            expect(respuesta.statusCode).toBe(400);
            expect(respuesta.body.exitoso).toBe(false);
        });
    });

    describe("POST /api/autenticacion/login", () => {
        test("Debe iniciar sesión correctamente y retornar un token JWT", async () => {
            const contrasenaHasheada = await bcrypt.hash("contrasenaSegura123", 10);
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue({
                id_usuario: 1,
                nombres: "Adrian",
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                contrasena: contrasenaHasheada,
                activo: true,
                rol: { nombre: "ADMINISTRADOR", permisos: [] }
            });

            const payloadLogin = {
                correo: "adrian@unimayor.edu.co",
                contrasena: "contrasenaSegura123"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/autenticacion/login")
                .send(payloadLogin);

            expect(respuesta.statusCode).toBe(200);
            expect(respuesta.body.exitoso).toBe(true);
            expect(respuesta.body.tokenAcceso).toBeDefined();
            expect(respuesta.body.usuario.rol).toBe("ADMINISTRADOR");
        });

        test("Debe rechazar el inicio de sesión si la contraseña es incorrecta", async () => {
            const contrasenaHasheada = await bcrypt.hash("contrasenaSegura123", 10);
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue({
                id_usuario: 1,
                nombres: "Adrian",
                apellidos: "Velasco",
                correo: "adrian@unimayor.edu.co",
                contrasena: contrasenaHasheada,
                activo: true,
                rol: { nombre: "ADMINISTRADOR", permisos: [] }
            });

            const payloadLogin = {
                correo: "adrian@unimayor.edu.co",
                contrasena: "claveIncorrecta"
            };

            const respuesta = await supertest(aplicacionExpress)
                .post("/api/autenticacion/login")
                .send(payloadLogin);

            expect(respuesta.statusCode).toBe(401);
            expect(respuesta.body.exitoso).toBe(false);
            expect(respuesta.body.mensaje).toContain("no válidas");
        });

        test("Debe bloquear al usuario temporalmente tras 3 intentos fallidos (RN-Autenticacion-01)", async () => {
            controladorAutenticacion.servicioAutenticacion.buscarUsuarioPorCorreo.mockResolvedValue(null); // Usuario inexistente -> fallo

            const payloadLogin = {
                correo: "adrian@unimayor.edu.co",
                contrasena: "fallo"
            };

            // Intento 1
            const respuestaUno = await supertest(aplicacionExpress).post("/api/autenticacion/login").send(payloadLogin);
            expect(respuestaUno.statusCode).toBe(401);

            // Intento 2
            const respuestaDos = await supertest(aplicacionExpress).post("/api/autenticacion/login").send(payloadLogin);
            expect(respuestaDos.statusCode).toBe(401);

            // Intento 3 (Detona el bloqueo)
            const respuestaTres = await supertest(aplicacionExpress).post("/api/autenticacion/login").send(payloadLogin);
            expect(respuestaTres.statusCode).toBe(401);

            // Intento 4 (Debe estar bloqueado con HTTP 423)
            const respuestaCuatro = await supertest(aplicacionExpress).post("/api/autenticacion/login").send(payloadLogin);
            expect(respuestaCuatro.statusCode).toBe(423);
            expect(respuestaCuatro.body.mensaje).toContain("bloqueada");
        });
    });
});
