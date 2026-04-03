function slugify(text = "") {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function normalizeCategory(linea = "") {
  const value = linea.toString().toLowerCase().trim();

  if (value.includes("vin")) return "vinilicas";
  if (value.includes("esm")) return "esmaltes";
  if (value.includes("sell")) return "selladores";
  if (value.includes("auto")) return "automotriz";
  if (value.includes("recubr")) return "recubrimientos";

  return "vinilicas";
}

function guessColorHex(nombre = "") {
  const value = nombre.toLowerCase();

  if (value.includes("blanco")) return "#f5f5f5";
  if (value.includes("negro")) return "#1f2937";
  if (value.includes("gris")) return "#9ca3af";
  if (value.includes("rojo")) return "#dc2626";
  if (value.includes("vino")) return "#7f1d1d";
  if (value.includes("azul")) return "#2563eb";
  if (value.includes("verde")) return "#16a34a";
  if (value.includes("amarillo")) return "#facc15";
  if (value.includes("naranja")) return "#f97316";
  if (value.includes("rosa")) return "#ec4899";
  if (value.includes("morado")) return "#9333ea";
  if (value.includes("cafe") || value.includes("café")) return "#8b5e3c";
  if (value.includes("beige")) return "#d6c4a1";
  if (value.includes("crema")) return "#f5e6b3";
  if (value.includes("marfil")) return "#f8f4e3";
  if (value.includes("arena")) return "#d4b483";
  if (value.includes("terracota")) return "#b45309";
  if (value.includes("turquesa")) return "#14b8a6";
  if (value.includes("lila")) return "#c084fc";

  return "#d1d5db";
}

function buildCatalogoDesdeProductos(productos = []) {
  const categorias = [
    { key: "all", label: "Todos" },
    { key: "vinilicas", label: "Vinílicas" },
    { key: "esmaltes", label: "Esmaltes" },
    { key: "selladores", label: "Selladores" },
    { key: "automotriz", label: "Automotriz" },
    { key: "recubrimientos", label: "Recubrimientos" }
  ];

  const map = new Map();

  for (const producto of productos) {
    const categoria = normalizeCategory(producto.linea);
    const colores = Array.isArray(producto.colores) ? producto.colores : [];

    for (const color of colores) {
      const nombre = String(color || "").trim();
      if (!nombre) continue;

      const slug = slugify(nombre);
      const key = `${categoria}::${slug}`;

      if (!map.has(key)) {
        map.set(key, {
          nombre,
          slug,
          categoria,
          hex: guessColorHex(nombre),
          totalProductos: 0,
          productos: []
        });
      }

      const entry = map.get(key);
      entry.totalProductos += 1;

      entry.productos.push({
        id: producto.id,
        nombre: producto.nombre,
        linea: producto.linea,
        precio: producto.precio,
        stock: producto.stock,
        img: producto.img
      });
    }
  }

  const colores = Array.from(map.values())
    .map(item => ({
      ...item,
      productos: item.productos.slice(0, 3)
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { categorias, colores };
}

function filtrarColores(colores = [], categoriaActiva = "all", q = "") {
  let filtrados = [...colores];

  if (categoriaActiva !== "all") {
    filtrados = filtrados.filter(c => c.categoria === categoriaActiva);
  }

  if (q) {
    const query = q.toLowerCase().trim();
    filtrados = filtrados.filter(c =>
      c.nombre.toLowerCase().includes(query)
    );
  }

  return filtrados;
}

module.exports = {
  slugify,
  normalizeCategory,
  guessColorHex,
  buildCatalogoDesdeProductos,
  filtrarColores
};