# Arquitectura Frontend y Sistema de Diseño - HorarioUniMayor

Este documento constituye la especificación de diseño técnico, accesibilidad, responsive e integración para el frontend del sistema **HorarioUniMayor** de la **Institución Universitaria Colegio Mayor del Cauca**.

---

## 🏛️ 1. Arquitectura del Frontend

El proyecto se estructurará de forma modular e independiente bajo la carpeta `frontend/src/` utilizando **Next.js (App Router)**.

### Estructura de Directorios

```
frontend/src/
├── app/                  # Rutas y páginas de la aplicación (Next.js App Router)
├── components/           # Componentes de UI
│   ├── ui/               # Biblioteca de componentes atómicos reutilizables (Botón, Input, Tabla, etc.)
│   └── compartidos/      # Componentes estructurados compartidos (Sidebar, Navbar, Breadcrumb, Footer)
├── layouts/              # Envoltorios de páginas (LayoutPrincipal, LayoutAutenticacion)
├── hooks/                # Custom hooks (ej. useAutenticacion, useHorarios)
├── services/             # Clientes de API REST (Axios)
├── context/              # Contextos de estado global (ContextoAutenticacion)
├── interfaces/           # Modelos de tipos estructurados en español
├── models/               # Clases y reglas de mapeo del dominio frontend
├── utils/                # Funciones auxiliares y formateadores
├── styles/               # Tokens de CSS y Tailwind
├── assets/               # Imagenes, logos institucionales y recursos estáticos
├── icons/                # Mapeo unificado de React Icons
├── middlewares/          # Control de acceso a rutas protegidas
├── constants/            # Constantes globales (URL de backend, límites)
└── validators/           # Esquemas de validación de formularios (React Hook Form)
```

---

## 🎨 2. Sistema de Diseño (Design System)

### Paleta de Colores Institucional (Estricta)
*   **Color Principal:** `rgba(0, 72, 132, 0.9)` (Azul Institucional Colegio Mayor)
*   **Color Secundario:** `rgb(2, 16, 130)` (Azul Fuerte de Contraste)
*   **Color de Fondo:** `#f2f2f2` (Gris Claro Institucional)
*   **Color de Tarjetas:** `#ffffff` (Blanco Puro)
*   **Color de Hover / Foco Activo:** `#ffdf56` (Amarillo Oro)
*   *Nota: No se permite el uso de ningún otro tono de azul fuera de los especificados en este contrato arquitectónico.*

### Tipografía
*   **Fuente:** `Inter` o `Roboto` (cargada dinámicamente mediante Google Fonts en Next.js).
*   **Escala de Tamaños:**
    *   `Texto Pequeño (sm)`: `0.875rem` (14px) - Mínimo absoluto para texto informativo secundario.
    *   `Texto Base (base)`: `1rem` (16px) - Estándar para párrafos y lectura principal.
    *   `Subtítulos (lg/xl)`: `1.125rem` / `1.25rem` (18px / 20px).
    *   `Títulos Secundarios (2xl/3xl)`: `1.5rem` / `1.875rem`.
    *   `Título Principal (4xl)`: `2.25rem` (36px).

### Espaciados (Múltiplos de 8px)
*   `xs`: `4px` (`0.25rem`)
*   `sm`: `8px` (`0.5rem`)
*   `md`: `16px` (`1rem`)
*   `lg`: `24px` (`1.5rem`)
*   `xl`: `32px` (`2rem`)
*   `xxl`: `48px` (`3rem`)

### Bordes y Sombras
*   `Bordes Redondeados (Rounded):` Estándar de `rounded-lg` (`8px`) para inputs y tarjetas; `rounded-md` (`6px`) para botones.
*   `Sombras (Shadow):` `shadow-sm` para bordes tenues, `shadow-md` para tarjetas principales. No sobrecargar.

---

## 🛠️ 3. Guía de Componentes Reutilizables (`components/ui`)

Cada componente básico debe ser agnóstico al negocio y completamente desacoplado:

1.  **`Boton`:** Soporta variantes de color (principal, secundario, peligro), estados interactivos (Hover, Focus con outline amarillo visible, Disabled con aria-disabled, y Loading con Spinner integrado).
2.  **`InputText`:** Valida estados de error mediante bordes rojos de alto contraste e incorpora mensajes descriptivos de error legibles por lectores de pantalla (`aria-describedby` y `aria-invalid`).
3.  **`Select` / `CheckBox` / `Radio`:** Componentes nativos estilizados para garantizar compatibilidad con lectores de pantalla y navegación por teclado natural.
4.  **`Tabla`:** Responsive, con paginación, filtros de ordenamiento estructurados, buscador, botones de exportación (Excel/PDF) y placeholders de carga (Skeleton).

---

## 🤝 4. Convenciones de Consumo de API REST

*   Cliente unificado basado en **Axios** en `src/services/clienteApi.js`.
*   Toda consulta o mutación asíncrona debe ser encapsulada mediante **React Query** (`useQuery` y `useMutation`) para optimizar el almacenamiento en caché y la re-validación automática en foco.
*   Los payloads y DTOs enviados coinciden de forma estricta con el backend en español.

---

## ♿ 5. Convenciones de Accesibilidad (WCAG 2.1 AA)

*   **Skip to Content:** Enlace invisible al cargar que aparece en foco de teclado para saltar directamente al contenedor principal.
*   **Focus Visible:** Todo elemento interactivo en foco debe tener una sombra o contorno amarillo de contraste (`ring-2 ring-[#ffdf56]`).
*   **Atributos Aria:** Todos los modales deben tener `role="dialog"`, `aria-modal="true"`, y elementos activos deben implementar `aria-current="page"`, `aria-expanded` y `aria-live="polite"` para alertas.

---

## 📱 6. Convenciones de Responsive

*   **Mobile-First:** Los estilos de Tailwind se definirán para pantallas pequeñas por defecto y se escalarán mediante breakpoints:
    *   `320px` a `414px` (Móviles)
    *   `768px` (Tablets - `md:`)
    *   `1024px` (Laptops - `lg:`)
    *   `1280px` a `1920px` (Escritorios - `xl:`, `2xl:`)
*   Se prohibe el uso de tamaños fijos de ancho (`width`) y alto (`height`) en contenedores estructurales. Se utilizará Flexbox y CSS Grid.

---

## 📝 7. Checklist de Calidad del Código (Prerrelegación)

- [ ] ¿El archivo comienza con la cabecera de trazabilidad requerida?
- [ ] ¿El código y comentarios están 100% en español (variables, funciones, componentes)?
- [ ] ¿Cumple con la relación de contraste WCAG 2.1 AA (mínimo 4.5:1)?
- [ ] ¿Todos los elementos interactivos responden al foco del teclado y son seleccionables con `Enter`?
- [ ] ¿Las imágenes utilizan la etiqueta de Next.js `next/image` con su respectivo `alt`?
- [ ] ¿El componente está libre de llamadas directas a base de datos o lógica de servidor duplicada?
- [ ] ¿Pasa las pruebas de visualización en los breakpoints requeridos (320px a 1920px)?
