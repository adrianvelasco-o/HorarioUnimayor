/**
 * Caso de uso implementado: UC-25 (Crear Horario)
 * Requisitos funcionales relacionados: RF7, RF13, CAL-03, CAL-12
 * Escenarios QAW relacionados: QS-4 (Fiabilidad de cruce)
 * Componentes C4 involucrados: Fachada de Horario
 * Patrones de diseño utilizados: Facade (Fachada GoF), Singleton
 * Principios SOLID aplicados: SRP (Delegar y verificar coherencia y colisiones)
 */

const ServicioHorario = require("./servicioHorario");
const ServicioDocente = require("../docente/servicioDocente");
const ServicioSalon = require("../salon/servicioSalon");
const ServicioPeriodo = require("../periodo/servicioPeriodo");

class FachadaHorario {
    /**
     * @private
     * @type {FachadaHorario}
     */
    static #instanciaUnica = null;

    /**
     * @private
     */
    constructor() {
        if (FachadaHorario.#instanciaUnica) {
            throw new Error("Error: No se puede instanciar directamente un Singleton.");
        }
        this.servicioHorario = new ServicioHorario();
        this.servicioDocente = new ServicioDocente();
        this.servicioSalon = new ServicioSalon();
        this.servicioPeriodo = new ServicioPeriodo();
        FachadaHorario.#instanciaUnica = this;
    }

    /**
     * Objetivo: Obtener la instancia única.
     */
    static obtenerInstancia() {
        if (!FachadaHorario.#instanciaUnica) {
            new FachadaHorario();
        }
        return FachadaHorario.#instanciaUnica;
    }

    /**
     * Objetivo: Orquestar de forma simple la validación de colisiones y crear el horario.
     * Parámetros:
     *   - datos: {Object} ID periodo, docente, salón, materia/labor, día, hora inicio y fin.
     * Retorna: {Promise<Object>} Horario creado o lanza excepción si existe colisión.
     */
    async programarHorario(datos) {
        const { id_periodo, id_docente, id_salon, id_materia, id_labor, dia_semana, hora_inicio, hora_fin } = datos;

        // 1. RN-Horario-04: Validar rango de horas
        if (hora_inicio >= hora_fin) {
            throw new Error("Regla de negocio: La hora de inicio debe ser estrictamente anterior a la hora de fin.");
        }

        // 2. RN-Horario-05: Exclusividad de Materia o Labor
        if ((id_materia && id_labor) || (!id_materia && !id_labor)) {
            throw new Error("Regla de negocio: El horario debe asignarse a una Materia o a una Labor, de forma exclusiva.");
        }

        // 3. Validar existencia del Periodo
        const periodo = await this.servicioPeriodo.buscarPorId(id_periodo);
        if (!periodo) {
            throw new Error("El periodo académico no existe.");
        }

        // 4. Validar existencia del Docente y Salón
        const docente = await this.servicioDocente.buscarPorId(id_docente);
        if (!docente) {
            throw new Error("El docente no existe.");
        }

        const salon = await this.servicioSalon.buscarPorId(id_salon);
        if (!salon) {
            throw new Error("El ambiente/salón no existe.");
        }

        // Helper para verificar solapamiento de horas (formato 'HH:MM')
        const haySolapamiento = (iniA, finA, iniB, finB) => {
            return (iniA < finB && finA > iniB);
        };

        // 5. RN-Horario-01: Validar colisión de docente
        const horariosDocente = await this.servicioHorario.buscarHorariosDocentePorDia(id_docente, dia_semana);
        for (const h of horariosDocente) {
            if (haySolapamiento(hora_inicio, hora_fin, h.hora_inicio, h.hora_fin)) {
                throw new Error(`Colisión de horarios: El docente ya tiene asignada una actividad el día ${dia_semana} entre las ${h.hora_inicio} y ${h.hora_fin}.`);
            }
        }

        // 6. RN-Horario-02: Validar colisión de salón/ambiente
        const horariosSalon = await this.servicioHorario.buscarHorariosSalonPorDia(id_salon, dia_semana);
        for (const h of horariosSalon) {
            if (haySolapamiento(hora_inicio, hora_fin, h.hora_inicio, h.hora_fin)) {
                throw new Error(`Colisión de ambientes: El salón '${salon.nombre}' ya está ocupado el día ${dia_semana} entre las ${h.hora_inicio} y ${h.hora_fin}.`);
            }
        }

        // 7. RN-Horario-03: Validar límite de horas semanales del docente
        let horasNuevas = 0;
        if (id_materia) {
            const materia = await this.servicioPeriodo.buscarPorId(id_materia); // Mock or check db helper
            const materiaReal = await this.servicioDocente.buscarPorId(id_docente); // just query directly via prisma
            const queryMateria = await require("../../configuracion/baseDatos").obtenerClientePrisma().materia.findUnique({ where: { id_materia } });
            horasNuevas = queryMateria ? queryMateria.horas_semanales : 0;
        } else if (id_labor) {
            const queryLabor = await require("../../configuracion/baseDatos").obtenerClientePrisma().labor.findUnique({ where: { id_labor } });
            horasNuevas = queryLabor ? queryLabor.horas_semanales : 0;
        }

        const horasAcumuladas = await this.servicioHorario.obtenerHorasProgramadasDocente(id_docente, id_periodo);
        if (horasAcumuladas + horasNuevas > docente.horas_semanales_maximas) {
            throw new Error(`Límite excedido: El docente no puede superar las ${docente.horas_semanales_maximas} horas semanales (Tiene programadas ${horasAcumuladas} horas, sumaría ${horasNuevas} horas).`);
        }

        // 8. Superadas las validaciones de colisión, se crea el registro
        return await this.servicioHorario.crearHorario({
            id_periodo,
            id_docente,
            id_salon,
            id_materia,
            id_labor,
            dia_semana,
            hora_inicio,
            hora_fin
        });
    }
}

module.exports = FachadaHorario;
