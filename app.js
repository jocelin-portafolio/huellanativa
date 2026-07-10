/**
 * ==========================================================================
 * HUELLA NATIVA - LÓGICA DE LA APLICACIÓN (VANILLA JAVASCRIPT)
 * Arquitectura modular, Validación Robusta, Prevención XSS y Simulación IoT
 * ==========================================================================
 */

// --- ESTADOS DE LA APLICACIÓN (MEMORIA DE EJECUCIÓN Y PERSISTENCIA) ---
const estadoApp = {
  usuarios: [],
  carrito: [],
  bluetoothConectado: false,
  alertaEstresActiva: false,
  bateriaPudu: 0,
  filtroCategoria: "todos",
  filtroBusqueda: "",
  correoRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telefonoRegex: /^(\+?56)?\s?9\d{8}$/ // Valida formato chileno móvil (+56 9 12345678 o 912345678) o general
};

// --- CATÁLOGO DE PRODUCTOS (INVENTARIO OUTDOOR ADAPTATIVO) ---
const productosInventario = [
  {
    id: "p1",
    nombre: "Parka Cortaviento 'Viento Andino'",
    precio: 120000,
    imagen: "parka.png",
    categoria: "Indumentaria",
    caracteristicas: ["Cierres Magnéticos", "Costuras Planas", "Ultra Liviana"],
    descripcion: "Equipada con cierres magnéticos alemanes para potenciar la autonomía del niño. Costuras termo-selladas planas que eliminan la hipersensibilidad al roce."
  },
  {
    id: "p2",
    nombre: "Pantalón Técnico 'Sendero Libre'",
    precio: 65000,
    imagen: "pantalon.png",
    categoria: "Indumentaria",
    caracteristicas: ["Sin Cinturón", "Rodillas Reforzadas", "Textura Suave"],
    descripcion: "Cintura elástica reforzada sin broches ni botones molestos. Diseñado para facilitar el vestir independiente y brindar confort proprioceptivo."
  },
  {
    id: "p3",
    nombre: "Mochila Ergonómica 'Pudú Hug'",
    precio: 48000,
    imagen: "mochila.png",
    categoria: "Accesorios",
    caracteristicas: ["Distribución de Peso", "Presión Profunda", "Tiradores Grandes"],
    descripcion: "Sistema de arnés ancho que distribuye el peso simulando una contención propioceptiva (abrazo). Incluye compartimento suave para peluches."
  },
  {
    id: "p4",
    nombre: "Calcetines de Compresión 'Tacto Cero'",
    precio: 12000,
    imagen: "calcetines.png",
    categoria: "Indumentaria",
    caracteristicas: ["Sin Costuras", "Compresión Graduada", "Lana Merino"],
    descripcion: "Hechos 100% sin costuras en puntera ni talón para evitar la irritación táctil. Lana merino que mantiene la temperatura perfecta."
  }
];

// --- ESTRATEGIAS CLÍNICAS Y ACTIVIDADES "ANTIGRAVEDAD" POR PERFIL SENSORIAL ---
const estrategiasSensoriales = {
  Hipersensible: {
    titulo: "Plan de Expedición Silenciosa (Evitativo Sensorial)",
    senderismo: [
      "Elegir rutas de baja densidad (ej: senderos de bosque denso que absorban el sonido).",
      "Caminar en horarios tempranos (entre las 7:30 y 9:30 AM) para evitar estímulos auditivos estresantes.",
      "Llevar gorro adaptativo con orejeras acolchadas suaves para aislar el viento y ruidos fuertes."
    ],
    antigravedad: [
      "El Refugio de la Cumbre: Construir una carpa de interior usando sábanas gruesas y luces cálidas tenues, recreando el viento andino con música suave.",
      "Exploración de Texturas del Bosque: Analizar hojas secas y piedras lisas recolectadas a su propio ritmo sin presiones."
    ]
  },
  Hiposensible: {
    titulo: "Plan de Exploración Activa (Baja Reactividad)",
    senderismo: [
      "Fijar hitos visuales de colores contrastantes (Safety Orange) en el sendero para promover el enfoque.",
      "Fomentar paradas propioceptivas: tocar texturas rugosas de árboles, oler hojas de Boldo machacadas.",
      "Coordinar pasos con un bastón de trekking adaptado para dar retroalimentación física constante."
    ],
    antigravedad: [
      "El Sendero Táctil: Crear un circuito en casa con cojines, texturas rugosas, lana y legumbres secas para cruzar descalzo.",
      "Escalada Vertical: Simular la subida a un volcán usando sofás y cojines gigantes para activar el equilibrio y fuerza muscular."
    ]
  },
  Buscador: {
    titulo: "Plan de Expedición Pesada (Buscador Sensorial)",
    senderismo: [
      "Llevar la mochila adaptativa con un peso controlado y distribuido (aprox. 5% a 10% del peso del niño) para dar presión profunda constante.",
      "Incorporar desafíos motrices en ruta: trepar pequeñas rocas y saltar obstáculos naturales estables.",
      "Utilizar calzado de trekking con planta rígida que maximice la vibración propioceptiva del terreno."
    ],
    antigravedad: [
      "Tensión de Cuerda Andina: Juegos de tirar la cuerda elástica o saltar en un mini-trampolín simulando saltar grietas de glaciares.",
      "Abrazo del Cóndor: Envolver al niño de forma firme en mantas pesadas, recreando un refugio andino de alta presión táctil."
    ]
  }
};

// --- ESTRATEGIAS DE EMERGENCIA PUDÚSENS (IoT) ---
const estrategiasEmergenciaPudu = [
  "Abrazo de Presión Profunda: Realizar compresión firme pero suave sobre los hombros y espalda del niño utilizando la mochila adaptada.",
  "Refugio Auditivo de Montaña: Colocar el gorro protector o audífonos con sonido blanco/viento andino para aislar el entorno inmediato."
];


// --- UTILIDADES DE SEGURIDAD Y DOM (PREVENCIÓN XSS Y MODULARIDAD) ---

/**
 * Sanitiza una cadena de texto para evitar inyecciones HTML/JS.
 * Aunque inyectaremos usando textContent, esta función es una capa extra
 * de seguridad que limpia caracteres conflictivos.
 * @param {string} texto - Entrada del usuario
 * @returns {string} Texto sanitizado
 */
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

/**
 * Helper modular DRY para la creación de elementos del DOM con atributos de manera limpia.
 * @param {string} tag - Etiqueta HTML a instanciar
 * @param {Object} atributos - Clave-valor de atributos y clases a agregar
 * @param {string} texto - Texto interno del nodo asignado de forma XSS-safe
 * @returns {HTMLElement} Elemento DOM construido
 */
function crearElemento(tag, atributos = {}, texto = "") {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(atributos)) {
    if (key === "class" || key === "className") {
      el.className = value;
    } else {
      el.setAttribute(key, value);
    }
  }
  if (texto !== "") {
    el.textContent = texto;
  }
  return el;
}

/**
 * Helper modular DRY para instanciar iconos SVG utilizando el namespace correcto.
 * Elimina por completo la necesidad de inyecciones innerHTML.
 * @param {string|string[]} pathsData - String o array de strings con los path vectoriales
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @param {number} strokeWidth - Grosor de línea
 * @param {Object} attributes - Atributos de SVG adicionales
 * @returns {SVGElement} Elemento SVG generado en memoria
 */
function crearIconoSvg(pathsData, width = 24, height = 24, strokeWidth = 2, attributes = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", strokeWidth.toString());
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  
  for (const [key, value] of Object.entries(attributes)) {
    svg.setAttribute(key, value);
  }

  const paths = Array.isArray(pathsData) ? pathsData : [pathsData];
  paths.forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  });

  return svg;
}

/**
 * Muestra una notificación emergente tipo Toast en la pantalla.
 * @param {string} mensaje - Mensaje a desplegar
 * @param {string} tipo - "success", "error", o "info"
 */
function mostrarToast(mensaje, tipo = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = crearElemento("div", { class: `toast-message toast-${tipo}` });
  
  let icono;
  if (tipo === "success") {
    // Checkmark icon
    icono = crearIconoSvg("M20 6L9 17l-5-5", 24, 24, 2.5);
  } else if (tipo === "error") {
    // Alert Triangle icon
    icono = crearIconoSvg(["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"], 24, 24, 2);
  } else {
    // Info icon
    icono = crearIconoSvg(["M12 8v4", "M12 16h.01", "M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"], 24, 24, 2);
  }

  const textSpan = crearElemento("span", {}, mensaje);
  
  const iconWrapper = crearElemento("div", { class: "toast-icon" });
  iconWrapper.appendChild(icono);
  
  toast.appendChild(iconWrapper);
  toast.appendChild(textSpan);
  container.appendChild(toast);

  // Gatilla la animación de entrada
  setTimeout(() => {
    toast.classList.add("toast-fade-in");
  }, 10);

  // Animación de salida y remoción
  setTimeout(() => {
    toast.classList.remove("toast-fade-in");
    toast.classList.add("toast-fade-out");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 3200);
}


// --- GESTIÓN DE LOCALSTORAGE (PERSISTENCIA COMPLETA) ---

function guardarUsuariosLocal() {
  localStorage.setItem("huella_nativa_usuarios", JSON.stringify(estadoApp.usuarios));
}

function guardarCarritoLocal() {
  localStorage.setItem("huella_nativa_carrito", JSON.stringify(estadoApp.carrito));
}

function cargarEstadoLocal() {
  try {
    const usuariosGuardados = localStorage.getItem("huella_nativa_usuarios");
    if (usuariosGuardados) {
      estadoApp.usuarios = JSON.parse(usuariosGuardados);
    }
    
    const carritoGuardado = localStorage.getItem("huella_nativa_carrito");
    if (carritoGuardado) {
      estadoApp.carrito = JSON.parse(carritoGuardado);
    }
  } catch (error) {
    console.error("Error al acceder a LocalStorage", error);
  }
}


// --- INICIALIZACIÓN DEL DOM Y EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Carga inicial de datos de persistencia
  cargarEstadoLocal();

  // Elementos SPA Navigation
  const tabHomeBtn = document.getElementById("tab-home-btn");
  const tabDashboardBtn = document.getElementById("tab-dashboard-btn");
  const tabStoreBtn = document.getElementById("tab-store-btn");
  
  const homeSection = document.getElementById("home-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const storeSection = document.getElementById("store-section");

  // Elementos de CTA del Hero
  const heroCtaDashboard = document.getElementById("hero-cta-dashboard");
  const heroCtaStore = document.getElementById("hero-cta-store");

  // Elementos del Carrito Drawer
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartOverlayBtn = document.getElementById("cart-overlay-btn");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartBadge = document.getElementById("cart-badge");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Elementos de Registro Clínico
  const explorerForm = document.getElementById("explorer-form");
  const explorerName = document.getElementById("explorer-name");
  const caregiverContact = document.getElementById("caregiver-contact");
  const sensoryProfile = document.getElementById("sensory-profile");
  const clinicalNotes = document.getElementById("clinical-notes");
  const emptyState = document.getElementById("empty-state");
  const strategyResult = document.getElementById("strategy-result");

  // Mensajes de Error
  const nameError = document.getElementById("name-error");
  const contactError = document.getElementById("contact-error");
  const profileError = document.getElementById("profile-error");
  const notesError = document.getElementById("notes-error");

  // Elementos PudúSens IoT
  const connectionIndicator = document.getElementById("connection-indicator");
  const indicatorText = connectionIndicator.querySelector(".status-text");
  const connectBtn = document.getElementById("pudu-connect-btn");
  const stressBtn = document.getElementById("pudu-stress-btn");
  const connectionStatusVal = document.getElementById("pudu-connection-status");
  const batteryLevelBar = document.getElementById("pudu-battery-level");
  const batteryTextVal = document.getElementById("pudu-battery-text");
  const stressIndexVal = document.getElementById("pudu-stress-index");
  const alertArea = document.getElementById("pudu-alert-area");

  // Tienda y Controles de Búsqueda/Filtrado
  const productGrid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");


  // --- 1. SPA NAVEGACIÓN ---
  
  function cambiarPestana(tabActiva) {
    // Resetear clases activas y atributos aria-selected
    tabHomeBtn.classList.remove("active");
    tabHomeBtn.setAttribute("aria-selected", "false");
    tabDashboardBtn.classList.remove("active");
    tabDashboardBtn.setAttribute("aria-selected", "false");
    tabStoreBtn.classList.remove("active");
    tabStoreBtn.setAttribute("aria-selected", "false");

    homeSection.classList.remove("active");
    dashboardSection.classList.remove("active");
    storeSection.classList.remove("active");

    // Activar pestaña seleccionada
    if (tabActiva === "home") {
      tabHomeBtn.classList.add("active");
      tabHomeBtn.setAttribute("aria-selected", "true");
      homeSection.classList.add("active");
    } else if (tabActiva === "dashboard") {
      tabDashboardBtn.classList.add("active");
      tabDashboardBtn.setAttribute("aria-selected", "true");
      dashboardSection.classList.add("active");
      renderizarHistorialExploradores();
    } else if (tabActiva === "store") {
      tabStoreBtn.classList.add("active");
      tabStoreBtn.setAttribute("aria-selected", "true");
      storeSection.classList.add("active");
      renderizarCatalogo();
    }
    
    // Hacer scroll al tope de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Listeners de navegación de cabecera
  tabHomeBtn.addEventListener("click", () => cambiarPestana("home"));
  tabDashboardBtn.addEventListener("click", () => cambiarPestana("dashboard"));
  tabStoreBtn.addEventListener("click", () => cambiarPestana("store"));

  // Listeners de los CTA en el Hero
  heroCtaDashboard.addEventListener("click", () => cambiarPestana("dashboard"));
  heroCtaStore.addEventListener("click", () => cambiarPestana("store"));


  // --- 2. GESTIÓN DEL CARRITO (SLIDE-OVER DRAWER) ---

  function toggleCart(abrir) {
    if (abrir) {
      cartDrawer.classList.add("active");
      cartDrawer.setAttribute("aria-hidden", "false");
    } else {
      cartDrawer.classList.remove("active");
      cartDrawer.setAttribute("aria-hidden", "true");
    }
  }

  cartToggleBtn.addEventListener("click", () => toggleCart(true));
  cartCloseBtn.addEventListener("click", () => toggleCart(false));
  cartOverlayBtn.addEventListener("click", () => toggleCart(false));


  // --- 3. RENDERING E-COMMERCE CON BÚSQUEDA Y FILTRADO (PREVENCIÓN XSS 100% PURA) ---

  function renderizarCatalogo() {
    // Limpiamos catálogo de forma segura
    productGrid.textContent = "";

    // Aplicamos filtro de categoría y búsqueda en tiempo real
    const productosFiltrados = productosInventario.filter((prod) => {
      const coincideCategoria = estadoApp.filtroCategoria === "todos" || prod.categoria === estadoApp.filtroCategoria;
      
      const query = estadoApp.filtroBusqueda.toLowerCase().trim();
      const coincideBusqueda = !query || 
        prod.nombre.toLowerCase().includes(query) || 
        prod.descripcion.toLowerCase().includes(query) ||
        prod.caracteristicas.some(c => c.toLowerCase().includes(query)) ||
        prod.categoria.toLowerCase().includes(query);

      return coincideCategoria && coincideBusqueda;
    });

    if (productosFiltrados.length === 0) {
      const noResults = crearElemento("div", { class: "empty-state card" });
      const title = crearElemento("h4", {}, "Sin resultados en el inventario");
      const desc = crearElemento("p", {}, "Prueba buscando otra palabra clave o cambiando la categoría del filtro.");
      noResults.appendChild(title);
      noResults.appendChild(desc);
      productGrid.appendChild(noResults);
      return;
    }

    productosFiltrados.forEach((prod) => {
      // Creamos contenedor del producto
      const card = crearElemento("div", { class: "product-card card" });

      // Contenedor de la Imagen
      const imgContainer = crearElemento("div", { class: "product-image-container" });
      
      const badge = crearElemento("span", { class: "product-badge" }, prod.categoria);

      // Creamos elemento de imagen real
      const img = crearElemento("img", {
        src: prod.imagen,
        alt: prod.nombre,
        class: "product-img"
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(badge);

      // Cuerpo del Producto
      const details = crearElemento("div", { class: "product-details" });

      const name = crearElemento("h3", { class: "product-name" }, prod.nombre);

      const price = crearElemento("p", { class: "product-price" }, `$${prod.precio.toLocaleString("es-CL")} CLP`);

      const desc = crearElemento("p", { class: "product-desc" }, prod.descripcion);

      // Etiquetas de Características
      const featuresContainer = crearElemento("div", { class: "product-features" });
      
      prod.caracteristicas.forEach((feat) => {
        const featTag = crearElemento("span", { class: "feature-tag" }, feat);
        featuresContainer.appendChild(featTag);
      });

      // Botón Añadir
      const addBtn = crearElemento("button", { class: "btn btn-primary btn-full" }, "Añadir al Carrito");
      addBtn.addEventListener("click", () => agregarAlCarrito(prod.id));

      // Ensamblaje
      details.appendChild(name);
      details.appendChild(price);
      details.appendChild(desc);
      details.appendChild(featuresContainer);
      details.appendChild(addBtn);

      card.appendChild(imgContainer);
      card.appendChild(details);

      productGrid.appendChild(card);
    });
  }

  // --- Lógica del Carrito ---

  function agregarAlCarrito(idProducto) {
    const itemExistente = estadoApp.carrito.find(item => item.productoId === idProducto);
    const prod = productosInventario.find(p => p.id === idProducto);
    
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      estadoApp.carrito.push({ productoId: idProducto, cantidad: 1 });
    }

    guardarCarritoLocal();
    actualizarCarrito();
    
    if (prod) {
      mostrarToast(`Añadido al carrito: ${prod.nombre}`, "success");
    }
  }

  function cambiarCantidadCarrito(idProducto, cambio) {
    const item = estadoApp.carrito.find(item => item.productoId === idProducto);
    if (!item) return;

    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      estadoApp.carrito = estadoApp.carrito.filter(item => item.productoId !== idProducto);
    }
    
    guardarCarritoLocal();
    actualizarCarrito();
  }

  function eliminarDelCarrito(idProducto) {
    const prod = productosInventario.find(p => p.id === idProducto);
    estadoApp.carrito = estadoApp.carrito.filter(item => item.productoId !== idProducto);
    
    guardarCarritoLocal();
    actualizarCarrito();

    if (prod) {
      mostrarToast(`Removido del carrito: ${prod.nombre}`, "info");
    }
  }

  function actualizarCarrito() {
    // 1. Limpieza segura
    cartItemsContainer.textContent = "";

    let subtotal = 0;
    let itemsTotales = 0;

    if (estadoApp.carrito.length === 0) {
      // Estado vacío del carrito
      const emptyCart = crearElemento("div", { class: "cart-empty-state" });
      
      const cartIconWrapper = crearElemento("div", { style: "margin-bottom: 12px; color: var(--text-gray-dark);" });
      const cartIcon = crearIconoSvg([
        "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
        "M9 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
        "M20 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
      ], 48, 48, 1.5);
      cartIconWrapper.appendChild(cartIcon);

      const emptyText = crearElemento("p", {}, "Tu carrito adaptativo está vacío. Agrega prendas diseñadas para potenciar la aventura.");
      
      emptyCart.appendChild(cartIconWrapper);
      emptyCart.appendChild(emptyText);
      cartItemsContainer.appendChild(emptyCart);
      
      cartBadge.classList.add("hidden");
      cartBadge.textContent = "0";
    } else {
      // Renderizar items del carrito
      estadoApp.carrito.forEach((item) => {
        const prod = productosInventario.find(p => p.id === item.productoId);
        if (!prod) return;

        itemsTotales += item.cantidad;
        const itemSubtotal = prod.precio * item.cantidad;
        subtotal += itemSubtotal;

        // Estructura del item
        const itemRow = crearElemento("div", { class: "cart-item" });

        const itemImg = crearElemento("div", { class: "cart-item-img" });
        const cImg = crearElemento("img", {
          src: prod.imagen,
          alt: prod.nombre,
          class: "cart-img-thumbnail"
        });
        itemImg.appendChild(cImg);

        const details = crearElemento("div", { class: "cart-item-details" });

        const name = crearElemento("span", { class: "cart-item-name" }, prod.nombre);

        const price = crearElemento("span", { class: "cart-item-price" }, `$${itemSubtotal.toLocaleString("es-CL")} CLP`);

        const controls = crearElemento("div", { class: "cart-item-controls" });

        const picker = crearElemento("div", { class: "quantity-picker" });

        const btnDec = crearElemento("button", { class: "quantity-btn", "aria-label": `Restar un ${prod.nombre}` }, "-");
        btnDec.addEventListener("click", () => cambiarCantidadCarrito(prod.id, -1));

        const qtyVal = crearElemento("span", { class: "quantity-value" }, item.cantidad);

        const btnInc = crearElemento("button", { class: "quantity-btn", "aria-label": `Sumar un ${prod.nombre}` }, "+");
        btnInc.addEventListener("click", () => cambiarCantidadCarrito(prod.id, 1));

        picker.appendChild(btnDec);
        picker.appendChild(qtyVal);
        picker.appendChild(btnInc);

        const btnRemove = crearElemento("button", { 
          class: "btn-remove-item", 
          "aria-label": `Eliminar ${prod.nombre} del carrito` 
        });
        
        // Trash icon SVG
        const trashIcon = crearIconoSvg([
          "M3 6h18",
          "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
          "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        ], 18, 18, 2);
        btnRemove.appendChild(trashIcon);
        btnRemove.addEventListener("click", () => eliminarDelCarrito(prod.id));

        controls.appendChild(picker);
        controls.appendChild(btnRemove);

        details.appendChild(name);
        details.appendChild(price);
        details.appendChild(controls);

        itemRow.appendChild(itemImg);
        itemRow.appendChild(details);

        cartItemsContainer.appendChild(itemRow);
      });

      // Configuración de Badge
      cartBadge.classList.remove("hidden");
      cartBadge.textContent = itemsTotales;
    }

    // Totales
    cartSubtotal.textContent = `$${subtotal.toLocaleString("es-CL")} CLP`;
    cartTotal.textContent = `$${subtotal.toLocaleString("es-CL")} CLP`;
  }

  // Simulación Checkout
  checkoutBtn.addEventListener("click", () => {
    if (estadoApp.carrito.length === 0) {
      mostrarToast("Tu carrito está vacío. Agrega productos antes de pagar.", "error");
      return;
    }

    mostrarToast("🏔️ ¡Expedición en Marcha! Compra simulada exitosamente. Tu indumentaria ya está preparándose.", "success");
    estadoApp.carrito = [];
    guardarCarritoLocal();
    actualizarCarrito();
    toggleCart(false);
  });


  // --- 4. REGISTRO CLÍNICO Y HISTORIAL (DYNAMICO & XSS-FREE) ---

  // Evento Input Real-time para validación visual semántica
  [explorerName, caregiverContact, sensoryProfile].forEach((input) => {
    input.addEventListener("input", () => {
      validarCampoIndividual(input);
    });
    input.addEventListener("change", () => {
      validarCampoIndividual(input);
    });
  });

  function validarCampoIndividual(input) {
    let errorSpan;
    if (input.id === "explorer-name") errorSpan = nameError;
    else if (input.id === "caregiver-contact") errorSpan = contactError;
    else if (input.id === "sensory-profile") errorSpan = profileError;
    else return;

    const val = input.value.trim();

    if (!val) {
      input.classList.add("invalid-input");
      input.classList.remove("valid-input");
      return false;
    }

    if (input.id === "explorer-name" && val.length < 2) {
      input.classList.add("invalid-input");
      input.classList.remove("valid-input");
      return false;
    }

    if (input.id === "caregiver-contact") {
      const esCorreo = estadoApp.correoRegex.test(val);
      const esTelefono = estadoApp.telefonoRegex.test(val);
      if (!esCorreo && !esTelefono) {
        input.classList.add("invalid-input");
        input.classList.remove("valid-input");
        return false;
      }
    }

    // Si pasó todas las validaciones
    input.classList.remove("invalid-input");
    input.classList.add("valid-input");
    errorSpan.textContent = ""; // Borramos el texto del error
    return true;
  }

  explorerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Reseteamos errores previos
    nameError.textContent = "";
    contactError.textContent = "";
    profileError.textContent = "";
    notesError.textContent = "";

    // Sanitización de inputs
    const nombreClean = sanitizarInput(explorerName.value.trim());
    const contactoClean = sanitizarInput(caregiverContact.value.trim());
    const perfilClean = sensoryProfile.value;
    const notasClean = sanitizarInput(clinicalNotes.value.trim());

    let formValido = true;

    // Validación Campo Vacío Nombre
    if (!nombreClean) {
      nameError.textContent = "El nombre del explorador es obligatorio.";
      explorerName.classList.add("invalid-input");
      explorerName.focus();
      formValido = false;
    } else if (nombreClean.length < 2) {
      nameError.textContent = "El nombre debe tener al menos 2 caracteres.";
      explorerName.classList.add("invalid-input");
      explorerName.focus();
      formValido = false;
    } else {
      explorerName.classList.add("valid-input");
    }

    // Validación de Contacto con Regex combinada (Correo o Teléfono)
    if (!contactoClean) {
      contactError.textContent = "El contacto del cuidador es obligatorio.";
      caregiverContact.classList.add("invalid-input");
      if (formValido) caregiverContact.focus();
      formValido = false;
    } else {
      const esCorreo = estadoApp.correoRegex.test(contactoClean);
      const esTelefono = estadoApp.telefonoRegex.test(contactoClean);

      if (!esCorreo && !esTelefono) {
        contactError.textContent = "Ingresa un email válido (ej. juan@correo.cl) o un teléfono móvil (+569XXXXXXXX o 9XXXXXXXX).";
        caregiverContact.classList.add("invalid-input");
        if (formValido) caregiverContact.focus();
        formValido = false;
      } else {
        caregiverContact.classList.add("valid-input");
      }
    }

    // Validación Perfil Sensorial
    if (!perfilClean) {
      profileError.textContent = "Debes seleccionar un perfil sensorial.";
      sensoryProfile.classList.add("invalid-input");
      if (formValido) sensoryProfile.focus();
      formValido = false;
    } else {
      sensoryProfile.classList.add("valid-input");
    }

    // Si el formulario no es válido, detenemos el flujo
    if (!formValido) {
      mostrarToast("Por favor corrige los errores del formulario", "error");
      return;
    }

    // Guardado en memoria y LocalStorage
    const nuevoExplorador = {
      nombre: nombreClean,
      contacto: contactoClean,
      perfil: perfilClean,
      notas: notasClean || "Sin anotaciones del terapeuta.",
      timestamp: Date.now()
    };
    
    estadoApp.usuarios.push(nuevoExplorador);
    guardarUsuariosLocal();

    // Renderizar Bitácora del explorador actual
    renderizarEstrategiasClinicas(nuevoExplorador);
    
    // Renderizar Historial de exploradores en tabla
    renderizarHistorialExploradores();

    // Reset de estilos del formulario
    [explorerName, caregiverContact, sensoryProfile].forEach((input) => {
      input.classList.remove("valid-input", "invalid-input");
    });
    explorerForm.reset();

    mostrarToast(`¡Plan de Expedición creado para ${nombreClean}!`, "success");
  });

  function renderizarEstrategiasClinicas(exp) {
    const estrategia = estrategiasSensoriales[exp.perfil];
    if (!estrategia) return;

    // Limpiamos contenedor de resultados
    strategyResult.textContent = "";

    // Construimos la tarjeta dinámica de forma 100% segura usando createElement
    const card = crearElemento("div", { class: "strategy-card card" });

    // Insignia superior
    const badge = crearElemento("span", { class: "strategy-badge" }, exp.perfil);

    // Fila del título
    const titleRow = crearElemento("div", { class: "strategy-title-row" });
    const title = crearElemento("h3", {}, `Expedición de: ${exp.nombre}`);
    const caregiverTag = crearElemento("span", { class: "caregiver-info-tag" }, `Contacto: ${exp.contacto}`);

    titleRow.appendChild(title);
    titleRow.appendChild(caregiverTag);

    // Bloque 1: Senderismo Seguro
    const hikeBlock = crearElemento("div", { class: "strategy-block" });
    
    const hikeTitle = crearElemento("h4", {});
    const hikeIcon = crearIconoSvg(["M2 20h20", "M12 4V2", "M12 4L4 12h16L12 4z"], 24, 24, 2, { 
      style: "display:inline-block; vertical-align:middle; margin-right:4px;" 
    });
    hikeTitle.appendChild(hikeIcon);
    hikeTitle.appendChild(document.createTextNode("Senderismo y Regulación Natural"));

    const hikeList = crearElemento("ul");
    estrategia.senderismo.forEach((itemText) => {
      const li = crearElemento("li", {}, itemText);
      hikeList.appendChild(li);
    });

    hikeBlock.appendChild(hikeTitle);
    hikeBlock.appendChild(hikeList);

    // Bloque 2: Estrategias Antigravedad (Indoor)
    const indoorBlock = crearElemento("div", { class: "strategy-block" });
    
    const indoorTitle = crearElemento("h4", {});
    const indoorIcon = crearIconoSvg(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"], 24, 24, 2, {
      style: "display:inline-block; vertical-align:middle; margin-right:4px;"
    });
    indoorTitle.appendChild(indoorIcon);
    indoorTitle.appendChild(document.createTextNode("Actividades Antigravedad (Días de Lluvia)"));

    const indoorList = crearElemento("ul");
    estrategia.antigravedad.forEach((itemText) => {
      const li = crearElemento("li", {}, itemText);
      indoorList.appendChild(li);
    });

    indoorBlock.appendChild(indoorTitle);
    indoorBlock.appendChild(indoorList);

    // Bloque 3: Notas Terapéuticas/Clínicas
    const notesBlock = crearElemento("div", { class: "strategy-block" });
    const notesTitle = crearElemento("h4", {}, "Notas del Equipo Terapéutico (PIE / TO)");
    const notesContent = crearElemento("blockquote", { class: "clinical-notes-quote" }, exp.notas);

    notesBlock.appendChild(notesTitle);
    notesBlock.appendChild(notesContent);

    // Ensamblar Tarjeta Completa
    card.appendChild(badge);
    card.appendChild(titleRow);
    card.appendChild(hikeBlock);
    card.appendChild(indoorBlock);
    card.appendChild(notesBlock);

    // Agregamos al contenedor y cambiamos visibilidades
    strategyResult.appendChild(card);
    
    emptyState.classList.add("hidden");
    strategyResult.classList.remove("hidden");
  }

  // Renderizar la tabla de historial de exploradores desde LocalStorage de forma segura
  function renderizarHistorialExploradores() {
    const tbody = document.getElementById("history-tbody");
    if (!tbody) return;
    tbody.textContent = "";

    if (estadoApp.usuarios.length === 0) {
      const tr = crearElemento("tr");
      const td = crearElemento("td", { colspan: "4", class: "no-history-text" }, "No hay exploradores registrados en el historial local.");
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Ordenar de más reciente a más antiguo
    const ordenados = [...estadoApp.usuarios].sort((a, b) => b.timestamp - a.timestamp);

    ordenados.forEach((user) => {
      const tr = crearElemento("tr");
      tr.style.cursor = "pointer";

      const tdNombre = crearElemento("td", {}, user.nombre);
      
      const tdPerfil = crearElemento("td");
      const profileClass = `profile-tag ${user.perfil.toLowerCase()}`;
      const spanPerfil = crearElemento("span", { class: profileClass }, user.perfil);
      tdPerfil.appendChild(spanPerfil);
      
      const tdContacto = crearElemento("td", {}, user.contacto);
      
      const tdAccion = crearElemento("td");
      const btnEliminar = crearElemento("button", { 
        class: "btn-delete-history", 
        "aria-label": `Eliminar registro de ${user.nombre}` 
      });
      const trashIcon = crearIconoSvg([
        "M3 6h18",
        "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
        "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      ], 18, 18, 2);
      btnEliminar.appendChild(trashIcon);
      
      btnEliminar.addEventListener("click", (e) => {
        e.stopPropagation(); // Detiene click en fila
        // Eliminar del array
        estadoApp.usuarios = estadoApp.usuarios.filter(u => u.timestamp !== user.timestamp);
        guardarUsuariosLocal();
        renderizarHistorialExploradores();
        mostrarToast(`Registro de ${user.nombre} eliminado del historial`, "info");
        
        // Si el explorador activo en el dashboard fue eliminado, resetear bitácora
        const currentActiveTitle = document.querySelector(".strategy-card h3");
        if (currentActiveTitle && currentActiveTitle.textContent.includes(user.nombre)) {
          strategyResult.classList.add("hidden");
          emptyState.classList.remove("hidden");
        }
      });

      tdAccion.appendChild(btnEliminar);

      // Clic en fila carga la bitácora en la columna derecha
      tr.addEventListener("click", () => {
        renderizarEstrategiasClinicas(user);
        mostrarToast(`Cargado plan de expedición de ${user.nombre}`, "success");
      });

      tr.appendChild(tdNombre);
      tr.appendChild(tdPerfil);
      tr.appendChild(tdContacto);
      tr.appendChild(tdAccion);
      tbody.appendChild(tr);
    });
  }


  // --- 5. BUSCADOR Y FILTRADO DE LA TIENDA ---

  searchInput.addEventListener("input", (e) => {
    estadoApp.filtroBusqueda = e.target.value;
    renderizarCatalogo();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remover clase activa de botones
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      estadoApp.filtroCategoria = btn.getAttribute("data-category");
      renderizarCatalogo();
    });
  });


  // --- 6. MONITOREO PUDÚSENS IoT (SIMULADOR DE BLUETOOTH Y ESTRÉS) ---

  function gestionarConexionPudu() {
    if (!estadoApp.bluetoothConectado) {
      // Simular Conexión
      estadoApp.bluetoothConectado = true;
      estadoApp.bateriaPudu = 87; // Nivel inicial

      // UI Updates
      connectionIndicator.className = "connection-badge status-connected";
      indicatorText.textContent = "PudúSens Online";
      
      connectionStatusVal.textContent = "Conectado";
      connectionStatusVal.className = "status-value connected";
      
      batteryLevelBar.style.width = `${estadoApp.bateriaPudu}%`;
      batteryTextVal.textContent = `${estadoApp.bateriaPudu}%`;
      
      stressIndexVal.textContent = "Normal (42 ng/mL)";
      
      connectBtn.querySelector("span").textContent = "Desconectar Bluetooth";
      stressBtn.removeAttribute("disabled");

      mostrarToast("PudúSens conectado vía Bluetooth", "success");

      // Limpiar área de alertas a estado base
      alertArea.textContent = "";
      const baseMsg = crearElemento("div", { class: "empty-alerts" });
      const text = crearElemento("p", {}, "PudúSens Monitoreando. Estado Fisiológico Estable.");
      baseMsg.appendChild(text);
      alertArea.appendChild(baseMsg);
    } else {
      // Simular Desconexión
      estadoApp.bluetoothConectado = false;
      estadoApp.alertaEstresActiva = false;
      estadoApp.bateriaPudu = 0;

      // UI Resets
      connectionIndicator.className = "connection-badge status-disconnected";
      indicatorText.textContent = "PudúSens Offline";

      connectionStatusVal.textContent = "Desconectado";
      connectionStatusVal.className = "status-value offline";
      
      batteryLevelBar.style.width = "0%";
      batteryTextVal.textContent = "--%";
      
      stressIndexVal.textContent = "--";
      
      connectBtn.querySelector("span").textContent = "Conectar Bluetooth";
      stressBtn.setAttribute("disabled", "true");

      mostrarToast("PudúSens desconectado", "info");

      // Resetear alertas
      alertArea.textContent = "";
      const emptyMsg = crearElemento("div", { class: "empty-alerts" });
      const text = crearElemento("p", {}, "PudúSens inactivo. Conéctalo vía Bluetooth para iniciar la telemetría.");
      emptyMsg.appendChild(text);
      alertArea.appendChild(emptyMsg);
    }
  }

  function simularSobrecargaSensorial() {
    if (!estadoApp.bluetoothConectado) return;

    if (!estadoApp.alertaEstresActiva) {
      // Activar Alerta
      estadoApp.alertaEstresActiva = true;
      
      // Cambiar Indicadores a estrés
      connectionIndicator.className = "connection-badge status-stress";
      indicatorText.textContent = "PUDÚSENS ALERTA";
      
      connectionStatusVal.textContent = "SOBRECARGA";
      connectionStatusVal.className = "status-value danger";
      
      stressIndexVal.textContent = "Alto (128 ng/mL)";
      stressBtn.querySelector("span").textContent = "Resolver Alerta";

      mostrarToast("ALERTA: Sobrecarga sensorial detectada", "error");

      // Renderizar Alerta en el Aside de manera Segura (Sin innerHTML)
      alertArea.textContent = "";

      const alertBox = crearElemento("div", { class: "dysregulation-alert" });

      const alertHeader = crearElemento("div", { class: "alert-header" });
      const alertHeaderIcon = crearIconoSvg(["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"], 24, 24, 2, {
        style: "margin-right: 4px;"
      });
      alertHeader.appendChild(alertHeaderIcon);
      alertHeader.appendChild(document.createTextNode("Desregulación Detectada"));

      const alertBody = crearElemento("p", { class: "alert-body" }, "El sensor de ritmo cardíaco y conductividad del PudúSens ha detectado indicadores fisiológicos de estrés agudo.");

      const strategiesBlock = crearElemento("div", { class: "alert-strategies" });

      const stratTitle = crearElemento("h5", {}, "Acciones Inmediatas de Contención:");

      strategiesBlock.appendChild(stratTitle);

      // Renderizar las 2 pautas recomendadas
      estrategiasEmergenciaPudu.forEach((strat) => {
        const stratP = crearElemento("p", {}, strat);
        strategiesBlock.appendChild(stratP);
      });

      alertBox.appendChild(alertHeader);
      alertBox.appendChild(alertBody);
      alertBox.appendChild(strategiesBlock);

      alertArea.appendChild(alertBox);
    } else {
      // Resolver Alerta
      estadoApp.alertaEstresActiva = false;
      
      connectionIndicator.className = "connection-badge status-connected";
      indicatorText.textContent = "PudúSens Online";

      connectionStatusVal.textContent = "Conectado";
      connectionStatusVal.className = "status-value connected";
      
      stressIndexVal.textContent = "Normal (45 ng/mL)";
      stressBtn.querySelector("span").textContent = "Simular Sobrecarga";

      mostrarToast("Alerta resuelta. Explorador estabilizado.", "success");

      alertArea.textContent = "";
      const baseMsg = crearElemento("div", { class: "empty-alerts" });
      const text = crearElemento("p", {}, "PudúSens Monitoreando. Estado Fisiológico Estable.");
      baseMsg.appendChild(text);
      alertArea.appendChild(baseMsg);
    }
  }

  // Listeners IoT
  connectBtn.addEventListener("click", gestionarConexionPudu);
  stressBtn.addEventListener("click", simularSobrecargaSensorial);


  // --- INICIALIZACIÓN DE DATOS ---
  renderizarCatalogo();
  actualizarCarrito();
});
