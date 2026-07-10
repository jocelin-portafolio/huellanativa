# Bitácora de Uso de IA: Huella Nativa

Este documento detalla cómo la Inteligencia Artificial (IA) fue utilizada de manera estratégica para diseñar la arquitectura, optimizar el código, garantizar la ciberseguridad (XSS) e implementar las características de la rúbrica de evaluación sumativa de **Huella Nativa**.

---

## 1. Diseño y Generación de Expresiones Regulares (Regex)

Para validar el campo del contacto del cuidador, el cual es único pero flexible (acepta correo electrónico o número celular), se diseñaron dos expresiones de validación independientes que la IA ayudó a formular con precisión:

### A. Validación de Correo Electrónico
```javascript
const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```
- **`^` y `$`**: Delimitan el inicio y final de la cadena para asegurar una correspondencia exacta y evitar inyecciones parciales.
- **`[a-zA-Z0-9._%+-]+`**: Captura la parte local del correo electrónico de forma robusta, admitiendo caracteres especiales estándar.
- **`@`**: Símbolo obligatorio de separación de dominio.
- **`[a-zA-Z0-9.-]+`**: Nombre de dominio que permite subdominios y guiones.
- **`\.[a-zA-Z]{2,}`**: Exige la presencia de un punto literal seguido por un TLD de al menos 2 caracteres alfabéticos (ej. `.cl`, `.com`, `.org`).

### B. Validación de Teléfono Móvil (Chileno / General)
```javascript
const telefonoRegex = /^(\+?56)?\s?9\d{8}$/;
```
- **`(\+?56)?`**: Grupo opcional para capturar el prefijo telefónico internacional chileno con o sin el signo `+`.
- **`\s?`**: Permite un espacio en blanco opcional después del prefijo.
- **`9`**: Dígito obligatorio que marca el inicio de números celulares en Chile.
- **`\d{8}`**: Valida que existan exactamente 8 dígitos numéricos adicionales para sumar los 9 dígitos reglamentarios.

### C. Evaluación Lógica en JS
En lugar de forzar al usuario a rellenar dos campos distintos, la lógica generada por la IA valida el mismo input contra ambas expresiones:
```javascript
const esCorreo = estadoApp.correoRegex.test(contactoClean);
const esTelefono = estadoApp.telefonoRegex.test(contactoClean);

if (!esCorreo && !esTelefono) {
  // Disparar mensaje de error
}
```

---

## 2. Prevención Total de Ataques XSS (Cross-Site Scripting)

La seguridad es el pilar central en el manejo de datos de menores y notas terapéuticas. La IA diseñó el flujo de datos dinámicos bajo las siguientes pautas estrictas:

### A. Evasión Absoluta de `innerHTML`
Se descartó por completo el uso de `innerHTML` para la inserción de cualquier dato. Incluso para los elementos estáticos como iconos SVG o estados vacíos, se utilizó creación pura de elementos:
- **`document.createElement()`**: Instancia elementos vacíos de manera aislada en memoria.
- **`document.createElementNS("http://www.w3.org/2000/svg", "svg")`**: Crea elementos SVG con el namespace de XML adecuado para evitar brechas de seguridad asociadas con HTML parseado.
- **`textContent`**: Asigna el valor del texto de forma segura. Al usar `textContent`, el motor de renderizado del navegador interpreta el contenido estrictamente como texto plano, inhabilitando e imprimiendo cualquier etiqueta `<script>` o evento malicioso inyectado de forma inofensiva.
- **`appendChild()`**: Inserta los nodos limpios en el árbol del DOM.

*Ejemplo de renderizado seguro de notas clínicas:*
```javascript
const notesContent = crearElemento("blockquote", { class: "clinical-notes-quote" }, exp.notas);
notesBlock.appendChild(notesContent);
```

### B. Sanitización en Profundidad (Defense in Depth)
Adicionalmente, se implementó la función `sanitizarInput(str)` para limpiar caracteres de control de etiquetas HTML antes de cualquier procesamiento:
```javascript
function sanitizarInput(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
```

---

## 3. Sugerencia de la Estructura de Objetos

La IA estructuró la información en tres arrays de objetos principales para facilitar la escalabilidad y el orden semántico:

1. **`estadoApp.usuarios`**: Colección de exploradores registrados. Cada registro es un objeto que encapsula nombre, contacto sanitizado, perfil sensorial, notas terapéuticas y un timestamp de control.
2. **`productosInventario`**: Catálogo que desacopla la presentación visual de la lógica del catálogo. Facilita cambiar precios, nombres o agregar características técnicas (como cierres magnéticos) sin tocar la maquetación.
3. **`estrategiasSensoriales`**: Un mapa asociativo (`Hipersensible`, `Hiposensible`, `Buscador`) que contiene listas de estrategias outdoor e indoor (antigravedad) estructuradas en arrays de strings, garantizando un renderizado dinámico muy limpio.

---

## 4. Refactorización y Modularidad (Principio DRY)

Para evitar la repetición de código y mantener una arquitectura limpia, la IA guió la refactorización del código hacia funciones atómicas reutilizables con responsabilidades únicas:

- **`crearElemento(tag, atributos, texto)`**: Centraliza y estandariza la creación segura de elementos HTML, reduciendo la verbosidad de `document.createElement`.
- **`crearIconoSvg(paths, width, height, strokeWidth)`**: Centraliza la creación del namespace SVG de forma segura y reutilizable, eliminando los strings HTML para iconos.
- **`actualizarCarrito()`**: Sincroniza en un solo llamado el estado del carrito, calcula los totales, actualiza el badge dinámico del header e imprime las filas en el panel lateral deslizante.
- **`renderizarEstrategiasClinicas()`**: Encapsula el diseño visual de la bitácora del explorador aislándolo de la lógica del evento de submit del formulario.
- **`gestionarConexionPudu()` y `simularSobrecargaSensorial()`**: Centralizan la simulación IoT, modificando el estado del PudúSens en un solo punto del código y coordinando la alerta visual y las estrategias de emergencia.

---

## 5. Integración Multimedia e Interfaz de Inicio (UX/UI)

Para responder a los nuevos requerimientos estéticos de la landing page, se incorporaron y gestionaron recursos de video en HD de la siguiente manera:

### A. Políticas de Autoplay de Navegadores Modernos
Para que un video de fondo (`background video`) se reproduzca automáticamente sin requerir clics del usuario, la IA implementó los atributos indispensables de accesibilidad y reproducción segura en navegadores:
- **`autoplay`**: Indica el inicio inmediato de la reproducción.
- **`loop`**: Garantiza que el video actúe como un tapiz en bucle continuo.
- **`muted`**: Silencia el canal de audio. **Obligatorio** en las políticas de reproducción de Chrome, Safari y Edge para admitir el inicio automático.
- **`playsinline`**: Evita que los navegadores móviles (iOS Safari) abran el video en el reproductor nativo del sistema a pantalla completa, manteniéndolo empotrado dentro del layout de la SPA.

```html
<video class="hero-video" autoplay loop muted playsinline ...>
```

### B. Enrutamiento dinámico para CTAs del Hero
La IA estructuró la lógica para interceptar los clics en los botones de "Llamada a la Acción" (CTA) del Hero en la página de inicio. Esto permite cambiar el estado de las pestañas activas sin provocar recargas de página, brindando una experiencia fluida al usuario:
```javascript
// Transición fluida a la sección de registro clínico
heroCtaDashboard.addEventListener("click", () => cambiarPestana("dashboard"));
// Transición fluida al catálogo
heroCtaStore.addEventListener("click", () => cambiarPestana("store"));
```

---

## 6. Funcionalidades de Optimización para la Rúbrica

Para asegurar una evaluación sobresaliente en la Rúbrica Sumativa 2, la IA sugirió e implementó de forma proactiva las siguientes optimizaciones de valor:

### A. Filtrado y Búsqueda en Tiempo Real (Criterio 2)
Implementación de un buscador de texto y botones de filtrado de categorías en la tienda que actúan inmediatamente sobre el array `productosInventario` utilizando filtros no destructivos:
```javascript
const productosFiltrados = productosInventario.filter((prod) => {
  const coincideCategoria = estadoApp.filtroCategoria === "todos" || prod.categoria === estadoApp.filtroCategoria;
  const coincideBusqueda = !query || prod.nombre.toLowerCase().includes(query) ...;
  return coincideCategoria && coincideBusqueda;
});
```

### B. Persistencia Local con LocalStorage (Criterio 3 y 6)
Persistencia automática del estado del carrito de compras y del historial de niños registrados. Al recargar la página, la aplicación lee del almacenamiento local del navegador para no perder los datos del expedicionario:
```javascript
localStorage.setItem("huella_nativa_usuarios", JSON.stringify(estadoApp.usuarios));
```

### C. Sistema de Toasts para Microinteracciones (Criterio 6)
Creación de un sistema de notificaciones de tipo "Toast" que provee retroalimentación visual al usuario en tiempo real sobre el estado de la aplicación (ej: éxito al registrar un niño, alertas de error en inputs o adición de ropa al carrito).

### D. Historial Interactivo (Criterio 3)
La tabla de "Exploradores Registrados" permite visualizar el listado completo, eliminar registros (liberando memoria) y, al hacer clic sobre cualquier fila, carga dinámicamente las estrategias personalizadas del niño en el panel derecho.
