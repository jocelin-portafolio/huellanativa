# Huella Nativa

Single Page Application en **JavaScript vanilla** para un ecosistema outdoor orientado a familias con niños neurodivergentes. Integra tres módulos en una sola interfaz: **registro y perfil sensorial de cada niño**, **tienda de equipamiento adaptativo** con carrito persistente y un **monitor IoT simulado (PudúSens)** que detecta sobrecarga sensorial y propone estrategias de regulación.

![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## Funcionalidades

- **Navegación por pestañas sin recarga** (Inicio, Dashboard, Tienda) con hero en video de fondo.
- **Registro de exploradores:** formulario con validación en tiempo real y un único campo de contacto que acepta **correo o celular chileno**, validado contra dos expresiones regulares.
- **Estrategias personalizadas** según el perfil sensorial (hipersensible, hiposensible, buscador), con actividades outdoor e indoor.
- **Historial interactivo:** tabla ordenada por fecha; al seleccionar una fila se cargan las estrategias del niño.
- **E-commerce:** catálogo con búsqueda en tiempo real y filtro por categoría, carrito lateral con cantidades, totales y badge dinámico.
- **Monitor PudúSens:** simulación de conexión de un dispositivo IoT y de alertas de sobrecarga sensorial con estrategias de emergencia.
- **Notificaciones toast** para retroalimentación inmediata.
- **Persistencia** de usuarios y carrito en `localStorage`.

## Aspectos técnicos destacados

### Seguridad: prevención de XSS
- **Cero `innerHTML`.** Todo el contenido dinámico se construye con `createElement`, `createElementNS` (SVG) y `textContent`, de modo que el navegador trata los datos del usuario siempre como texto.
- **Defensa en profundidad:** `sanitizarInput()` escapa `& < > " ' /` antes de procesar cualquier entrada.

### Arquitectura y buenas prácticas
- **Estado centralizado** en un objeto `estadoApp` (usuarios, carrito, filtros) y datos desacoplados de la vista (`productosInventario`, `estrategiasSensoriales`).
- **Funciones atómicas reutilizables (DRY):** `crearElemento()`, `crearIconoSvg()`, `actualizarCarrito()`, `renderizarEstrategiasClinicas()`.
- **Filtrado no destructivo** con `Array.prototype.filter` sobre el inventario original.
- **Accesibilidad:** roles ARIA, etiquetas descriptivas y video de fondo con `muted` y `playsinline` para cumplir políticas de autoplay en escritorio y móvil.

El proceso de diseño asistido por IA (regex, prevención de XSS, refactorización) está documentado en [`USO_IA.md`](USO_IA.md).

## Ejecución

Proyecto estático sin dependencias: abre `index.html` en el navegador o sírvelo con cualquier servidor estático (por ejemplo, la extensión Live Server de VS Code).

## Estructura

```
├── index.html     # Marcado semántico de las tres vistas y el monitor IoT
├── styles.css     # Estilos y diseño responsive
├── app.js         # Estado, renderizado, validaciones, carrito y simulación IoT
├── *.png          # Imágenes del catálogo
└── USO_IA.md      # Bitácora de uso de IA
```
