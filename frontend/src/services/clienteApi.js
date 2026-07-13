import axios from "axios";

/**
 * Propósito: Cliente HTTP Axios configurado e interceptores de seguridad para adjuntar JWT
 * Caso de uso: UC-1 al UC-34 (Integración REST de datos)
 * Requisitos relacionados: RF1, RF8, RF7
 * Escenarios QAW: QS-1 (Seguridad en la transmisión), QS-4 (Confiabilidad)
 * Fecha: 2026-07-11
 */

const clienteApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar automáticamente el token JWT en las peticiones salientes
clienteApi.interceptors.request.use(
  (configuracion) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token_jwt");
      if (token) {
        configuracion.headers.Authorization = `Bearer ${token}`;
      }
    }
    return configuracion;
  },
  (errorPeticion) => {
    return Promise.reject(errorPeticion);
  }
);

// Interceptor de respuesta para gestionar de forma centralizada fallos de token o sesión
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  (errorRespuesta) => {
    const status = errorRespuesta.response ? errorRespuesta.response.status : null;
    
    // Si la API devuelve 401 Unauthorized, redirigir automáticamente al login
    if (status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
      localStorage.removeItem("token_jwt");
      localStorage.removeItem("usuario_sesion");
      window.location.href = "/login";
    }
    return Promise.reject(errorRespuesta);
  }
);

export default clienteApi;
