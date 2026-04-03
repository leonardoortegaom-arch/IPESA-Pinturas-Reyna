const ColoresModel = require("../models/colores.model");
const HomeModel = require("../models/home.model");
const productosModel = require("../models/productos.model");

function buildSearchProducts(productos = []) {
  return productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    linea: p.linea,
    img: p.img
  }));
}

exports.index = async (req, res) => {
  try {
    const { topNav } = HomeModel.getHomeData();
    const productosData = await productosModel.getProductosData();

    const { categorias, colores } = ColoresModel.buildCatalogoDesdeProductos(productosData.productos || []);

    const categoriaActiva = String(req.query.cat || "all").toLowerCase();
    const q = String(req.query.q || "").trim();

    const filtrados = ColoresModel.filtrarColores(colores, categoriaActiva, q);

    res.render("colores/index", {
      title: "Colores",
      topNav,
      activePath: "/colores",
      categorias,
      categoriaActiva,
      q,
      colores: filtrados,

      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en colores.controller:", error);

    const { topNav } = HomeModel.getHomeData();

    res.render("colores/index", {
      title: "Colores",
      topNav,
      activePath: "/colores",
      categorias: [],
      categoriaActiva: "all",
      q: "",
      colores: [],

      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: []
    });
  }
};