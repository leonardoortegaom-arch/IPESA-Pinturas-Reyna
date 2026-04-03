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

    res.render("privacidad/index", {
      title: "Politica de Privacidad",
      topNav: data.topNav,
      activePath: "/privacidad",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en privacidad.controller:", error);

    const data = HomeModel.getHomeData();

    res.render("privacidad/index", {
      title: "Politica de Privacidad",
      topNav: data.topNav,
      activePath: "/politica",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: []
    });
  }
};