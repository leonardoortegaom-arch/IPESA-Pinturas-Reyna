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
    const data = HomeModel.getHomeData();
    const productosData = await productosModel.getProductosData();

    res.render("terminos/index", {
      title: "Terminos",
      topNav: data.topNav,
      activePath: "/terminos",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en terminos.controller:", error);

    const data = HomeModel.getHomeData();

    res.render("terminos/index", {
      title: "Terminos",
      topNav: data.topNav,
      activePath: "/terminos",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: []
    });
  }
};