/**
 * Caso de uso implementado: UC-1 (Iniciar Sesión) y UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF1, RF2, RF32
 * Escenarios QAW relacionados: QS-1 (Seguridad - Tasa de intentos fallidos), QS-2 (Disponibilidad)
 * Componentes C4 involucrados: Controlador de Autenticación / API REST
 * Patrones de diseño utilizados: Singleton (Instancia única del controlador)
 * Principios SOLID aplicados: SRP (Responsabilidad única de control HTTP de autenticación)
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const configuracionApp = require("../../configuracion/entorno").obtenerInstancia();
const loggerAuditoria = require("../../configuracion/logger");
const FabricaUsuarios = require("./fabricaUsuarios");
const ServicioAutenticacion = require("./servicioAutenticacion");

class ControladorAutenticacion {
    /**
     * @private
     * @type {ControladorAutenticacion}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (ControladorAutenticacion.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioAutenticacion = new ServicioAutenticacion();
        
        // Mapa en memoria para controlar la tasa de intentos fallidos y el bloqueo temporal (RN-Autenticacion-01)
        // Estructura: clave = correo, valor = { intentosFallidos: Number, bloqueadoHasta: Date }
        this.registroIntentosFallidos = new Map();
        ControladorAutenticacion.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única del controlador.
     * Parámetros: Ninguno.
     * Valor retornado: {ControladorAutenticacion} Instancia única.
     */
    static obtenerInstancia() {
        if (!ControladorAutenticacion.#instanciaUnica) {
            new ControladorAutenticacion();
        }
        return ControladorAutenticacion.#instanciaUnica;
    }

    /**
     * Objetivo: Iniciar sesión del usuario validando credenciales y generando token JWT.
     * Parámetros:
     *   - peticion: {Object} Petición de Express (debe contener correo y contrasena).
     *   - respuesta: {Object} Respuesta de Express.
     * Valor retornado: {Promise<Object>} JSON con el token de acceso JWT.
     * Excepciones: HTTP 401 si las credenciales son inválidas, HTTP 423 si el usuario está bloqueado por intentos recurrentes.
     * Reglas de negocio aplicadas: RN-Autenticacion-01 (Límite de 3 intentos fallidos y bloqueo por 15 minutos).
     */
    async iniciarSesion(peticion, respuesta) {
        const { correo, contrasena } = peticion.body;
        const correoNormalizado = correo.trim().toLowerCase();

        // 1. Verificar si el usuario se encuentra actualmente bloqueado temporalmente
        const estadoIntento = this.registroIntentosFallidos.get(correoNormalizado);
        if (estadoIntento && estadoIntento.bloqueadoHasta && estadoIntento.bloqueadoHasta > new Date()) {
            const minutosRestantes = Math.ceil((estadoIntento.bloqueadoHasta - new Date()) / 60000);
            loggerAuditoria.warn(`Intento de login en cuenta bloqueada: ${correoNormalizado}.`);
            return respuesta.status(423).json({
                exitoso: false,
                mensaje: `Cuenta temporalmente bloqueada. Intente de nuevo en ${minutosRestantes} minuto(s).`
            });
        }

        try {
            // 2. Buscar al usuario por correo
            const registroUsuario = await this.servicioAutenticacion.buscarUsuarioPorCorreo(correoNormalizado);

            if (!registroUsuario) {
                this.#registrarIntentoFallido(correoNormalizado);
                return respuesta.status(401).json({
                    exitoso: false,
                    mensaje: "Credenciales de acceso no válidas."
                });
            }

            // 2.5. Validar que la cuenta esté activa (RBAC)
            if (!registroUsuario.activo) {
                return respuesta.status(403).json({
                    exitoso: false,
                    mensaje: "Su cuenta institucional se encuentra desactivada. Contacte al administrador."
                });
            }

            // 3. Validar contraseña cifrada
            const contrasenaCorrecta = await bcrypt.compare(contrasena, registroUsuario.contrasena);

            if (!contrasenaCorrecta) {
                this.#registrarIntentoFallido(correoNormalizado);
                return respuesta.status(401).json({
                    exitoso: false,
                    mensaje: "Credenciales de acceso no válidas."
                });
            }

            // 4. Login exitoso: Limpiar intentos fallidos
            this.registroIntentosFallidos.delete(correoNormalizado);

            // 4.5. Extraer array de códigos de permisos activos del Rol
            const permisosUsuario = (registroUsuario.rol?.permisos || [])
                .filter(rp => rp.permiso.activo)
                .map(rp => rp.permiso.codigo);

            // 5. Generar token JWT incluyendo ID, nombres, correo, rol y permisos (QS-1)
            const payloadToken = {
                idUsuario: registroUsuario.id_usuario,
                correo: registroUsuario.correo,
                nombres: registroUsuario.nombres,
                rol: registroUsuario.rol.nombre,
                permisos: permisosUsuario
            };

            const tokenJWT = jwt.sign(payloadToken, configuracionApp.jwtClaveSecreta, {
                expiresIn: configuracionApp.jwtExpiracion
            });

            // Registrar evento de auditoría de inicio de sesión (tolerancia a fallos para tests/indisponibilidad)
            try {
                const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();
                await clientePrisma.historialUsuario.create({
                    data: {
                        id_usuario: registroUsuario.id_usuario,
                        accion: "INICIO_SESION",
                        descripcion: `Inicio de sesión exitoso desde la IP: ${peticion.ip || "127.0.0.1"}`,
                        ip: peticion.ip || "127.0.0.1"
                    }
                });
            } catch (errorAuditoria) {
                loggerAuditoria.error(`Error al guardar bitácora de inicio de sesión: ${errorAuditoria.message}`);
            }

            loggerAuditoria.info(`Sesión iniciada correctamente para el usuario: ${correoNormalizado}.`);

            return respuesta.status(200).json({
                exitoso: true,
                mensaje: "Inicio de sesión correcto.",
                tokenAcceso: tokenJWT,
                usuario: {
                    nombres: registroUsuario.nombres,
                    apellidos: registroUsuario.apellidos,
                    correo: registroUsuario.correo,
                    rol: registroUsuario.rol.nombre,
                    permisos: permisosUsuario
                }
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en iniciarSesion: ${errorExcepcion.message}`);
            return respuesta.status(500).json({
                exitoso: false,
                mensaje: "Error interno del servidor al procesar el inicio de sesión."
            });
        }
    }

    /**
     * Objetivo: Registrar un nuevo usuario del sistema (Administrador o Docente) polimórficamente.
     * Parámetros:
     *   - peticion: {Object} Petición de Express.
     *   - respuesta: {Object} Respuesta de Express.
     * Valor retornado: {Promise<Object>} JSON con el registro guardado.
     * Excepciones: HTTP 409 si el correo ya está registrado, HTTP 400 si los campos son incorrectos.
     * Reglas de negocio aplicadas: RN-Campos-Obligatorios (nombres > 2 caracteres), Fábrica obligatoria de usuarios.
     */
    async registrarUsuario(peticion, respuesta) {
        const { nombres, apellidos, correo, contrasena, id_rol, activo } = peticion.body;

        try {
            // 1. Validar que el correo no esté previamente registrado
            const usuarioExistente = await this.servicioAutenticacion.buscarUsuarioPorCorreo(correo);
            if (usuarioExistente) {
                return respuesta.status(409).json({
                    exitoso: false,
                    mensaje: "El correo electrónico ya se encuentra registrado."
                });
            }

            // 2. Buscar el Rol seleccionado en base de datos para obtener su nombre
            const registroRol = await this.servicioAutenticacion.buscarRolPorId(id_rol);
            if (!registroRol) {
                return respuesta.status(400).json({
                    exitoso: false,
                    mensaje: "El rol institucional seleccionado no es válido."
                });
            }

            // 3. Crear el objeto polimórfico mediante la fábrica (Factory Method)
            const instanciaNuevaUsuario = await FabricaUsuarios.crearUsuario(registroRol.nombre, {
                nombres,
                apellidos,
                correo,
                contrasena,
                id_rol,
                activo
            });

            // 4. Guardar en base de datos mediante el servicio de persistencia
            const usuarioCreado = await this.servicioAutenticacion.guardarNuevoUsuario(instanciaNuevaUsuario);

            loggerAuditoria.info(`Nuevo usuario registrado exitosamente: ${correo} con rol ${registroRol.nombre}.`);

            // Registrar auditoría en la base de datos
            try {
                const clientePrisma = require("../../configuracion/baseDatos").obtenerClientePrisma();
                const idLogUsuario = peticion.usuario?.idUsuario || usuarioCreado.id_usuario;
                const nombresEjecutor = peticion.usuario ? `${peticion.usuario.nombres}` : "Sistema / Registro";
                
                await clientePrisma.historialUsuario.create({
                    data: {
                        id_usuario: idLogUsuario,
                        accion: "CREAR_USUARIO",
                        descripcion: `${nombresEjecutor} creó al usuario ${usuarioCreado.nombres} ${usuarioCreado.apellidos} (${usuarioCreado.correo}) con rol ${registroRol.nombre}`,
                        ip: peticion.ip || "127.0.0.1"
                    }
                });
            } catch (errorAuditoria) {
                loggerAuditoria.error(`Error al guardar bitácora de creación de usuario: ${errorAuditoria.message}`);
            }

            return respuesta.status(201).json({
                exitoso: true,
                mensaje: "Usuario registrado con éxito.",
                usuario: usuarioCreado
            });

        } catch (errorExcepcion) {
            loggerAuditoria.error(`Error en registrarUsuario: ${errorExcepcion.message}`);
            return respuesta.status(400).json({
                exitoso: false,
                mensaje: errorExcepcion.message
            });
        }
    }

    /**
     * @private
     * Objetivo: Registrar un intento de inicio de sesión fallido y aplicar el bloqueo de 15 minutos si llega a 3 intentos.
     */
    #registrarIntentoFallido(correo) {
        const estadoIntento = this.registroIntentosFallidos.get(correo) || { intentosFallidos: 0, bloqueadoHasta: null };
        estadoIntento.intentosFallidos += 1;

        if (estadoIntento.intentosFallidos >= 3) {
            // Bloquear cuenta por 15 minutos (900000 milisegundos)
            const tiempoBloqueo = new Date(Date.now() + 15 * 60 * 1000);
            estadoIntento.bloqueadoHasta = tiempoBloqueo;
            loggerAuditoria.warn(`Cuenta temporalmente bloqueada por exceso de intentos fallidos: ${correo}.`);
        }

        this.registroIntentosFallidos.set(correo, estadoIntento);
    }
}

module.exports = ControladorAutenticacion;
