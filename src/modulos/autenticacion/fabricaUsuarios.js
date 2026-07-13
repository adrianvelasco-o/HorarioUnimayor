/**
 * Caso de uso implementado: UC-2 (Registrar Usuario)
 * Requisitos funcionales relacionados: RF2, RF6
 * Escenarios QAW relacionados: QS-3 (Mantenibilidad)
 * Componentes C4 involucrados: Módulo de Autenticación
 * Patrones de diseño utilizados: Factory Method (Creación polimórfica de usuarios)
 * Principios SOLID aplicados: OCP (Abierto a extensiones de roles, Cerrado a modificaciones del cliente), LSP
 */

const bcrypt = require("bcrypt");

class UsuarioBase {
    /**
     * @param {Object} datosUsuario 
     */
    constructor(datosUsuario) {
        if (this.constructor === UsuarioBase) {
            throw new Error("Clase abstracta: No se puede instanciar directamente UsuarioBase.");
        }
        this.nombres = datosUsuario.nombres;
        this.apellidos = datosUsuario.apellidos;
        this.correo = datosUsuario.correo;
        this.contrasena = datosUsuario.contrasena;
        this.id_rol = datosUsuario.id_rol;
        this.activo = datosUsuario.activo;
    }

    /**
     * Objetivo: Obtener el nombre completo del usuario.
     * Parámetros: Ninguno.
     * Valor retornado: {String} Nombre completo.
     */
    obtenerNombreCompleto() {
        return `${this.nombres} ${this.apellidos}`;
    }
}

class Administrador extends UsuarioBase {
    /**
     * @param {Object} datosUsuario 
     */
    constructor(datosUsuario) {
        super(datosUsuario);
        this.esAdministrativo = true;
    }
}

class Docente extends UsuarioBase {
    /**
     * @param {Object} datosUsuario 
     */
    constructor(datosUsuario) {
        super(datosUsuario);
        this.esDocenteActivo = true;
    }
}

class UsuarioComun extends UsuarioBase {
    /**
     * @param {Object} datosUsuario 
     */
    constructor(datosUsuario) {
        super(datosUsuario);
        this.esUsuarioGeneral = true;
    }
}

class FabricaUsuarios {
    /**
     * Objetivo: Crear de forma polimórfica e inicializar un usuario según su rol.
     * Parámetros:
     *   - nombreRol: {String} Nombre del rol.
     *   - datosRegistro: {Object} Payload con nombres, apellidos, correo y contrasena en texto plano.
     * Valor retornado: {Promise<UsuarioBase>} Instancia de la subclase correspondiente con contraseña cifrada.
     * Excepciones:
     *   - {Error} Si la longitud del nombre es menor o igual a 2 caracteres.
     */
    static async crearUsuario(nombreRol, datosRegistro) {
        if (!datosRegistro.nombres || datosRegistro.nombres.trim().length <= 2) {
            throw new Error("Regla de negocio: El nombre del usuario debe ser mayor a 2 caracteres.");
        }

        if (!datosRegistro.apellidos || datosRegistro.apellidos.trim().length <= 2) {
            throw new Error("Regla de negocio: El apellido del usuario debe ser mayor a 2 caracteres.");
        }

        // Cifrar contraseña con bcrypt
        const contrasenaCifrada = await bcrypt.hash(datosRegistro.contrasena, 10);

        const datosUsuarioConstruido = {
            nombres: datosRegistro.nombres.trim(),
            apellidos: datosRegistro.apellidos.trim(),
            correo: datosRegistro.correo.trim().toLowerCase(),
            contrasena: contrasenaCifrada,
            id_rol: datosRegistro.id_rol,
            activo: datosRegistro.activo !== undefined ? datosRegistro.activo : true
        };

        const rolNormalizado = nombreRol.toUpperCase();

        if (rolNormalizado === "ADMINISTRADOR") {
            return new Administrador(datosUsuarioConstruido);
        } else if (rolNormalizado === "DOCENTE") {
            return new Docente(datosUsuarioConstruido);
        } else {
            // Retornar un usuario común para cualquier otro rol dinámico (adherencia a OCP)
            return new UsuarioComun(datosUsuarioConstruido);
        }
    }
}

module.exports = FabricaUsuarios;
