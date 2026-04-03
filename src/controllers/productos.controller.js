const productosModel = require("../models/productos.model");
const HomeModel = require("../models/home.model");

const { topNav } = HomeModel.getHomeData();

function buildSearchProducts(productos = []) {
  return productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    linea: p.linea,
    img: p.img
  }));
}

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

function prettifySlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

exports.index = async (req, res) => {
  try {
    const data = await productosModel.getProductosData();
    const searchQuery = (req.query.q || "").trim();
    const colorFilter = String(req.query.color || "").trim().toLowerCase();

    let productos = data.productos || [];
    let selectedColorName = "";

    if (colorFilter) {
      productos = productos.filter(p =>
        Array.isArray(p.colores) &&
        p.colores.some(color => slugify(color) === colorFilter)
      );

      const foundColor = (data.productos || [])
        .flatMap(p => Array.isArray(p.colores) ? p.colores : [])
        .find(color => slugify(color) === colorFilter);

      selectedColorName = foundColor || prettifySlug(colorFilter);
    }

    res.render("productos/index", {
      ...data,
      productos,
      topNav,
      searchQuery,
      colorFilter,
      selectedColorName,
      searchProducts: buildSearchProducts(data.productos || [])
    });
  } catch (error) {
    console.error("Error en productosController.index:", error);

    const colorFilter = String(req.query.color || "").trim().toLowerCase();

    res.render("productos/index", {
      title: "Productos | IPESA",
      categorias: [],
      usos: [],
      productos: [],
      topNav,
      searchQuery: (req.query.q || "").trim(),
      colorFilter,
      selectedColorName: colorFilter
        ? colorFilter
            .split("-")
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "",
      searchProducts: []
    });
  }
};

exports.detail = async (req, res) => {
  try {
    const producto = await productosModel.getProductoById(req.params.id);
    const data = await productosModel.getProductosData();

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    const relacionados = (data.productos || [])
      .filter(item => item.id !== producto.id && item.categoria === producto.categoria)
      .slice(0, 4);

    res.render("productos/detail", {
      title: `${producto.nombre} | IPESA`,
      producto,
      relacionados,
      topNav,
      searchQuery: "",
      searchProducts: buildSearchProducts(data.productos || [])
    });
  } catch (error) {
    console.error("Error en productosController.detail:", error);
    res.status(500).send("Error al cargar el producto");
  }
};

exports.getFavoritos = async (req, res) => {
  try {
    const idsQuery = String(req.query.ids || "").trim();

    if (!idsQuery) {
      return res.json({ ok: true, productos: [] });
    }

    const ids = idsQuery
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    if (!ids.length) {
      return res.json({ ok: true, productos: [] });
    }

    const productos = await productosModel.getProductosByIds(ids);

    return res.json({
      ok: true,
      productos: productos || []
    });
  } catch (error) {
    console.error("Error en productosController.getFavoritos:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener productos favoritos."
    });
  }
};