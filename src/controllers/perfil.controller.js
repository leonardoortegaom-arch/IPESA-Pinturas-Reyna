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

    res.render("perfil/index", {
      title: "Mi cuenta",
      topNav: data.topNav,
      activePath: null,
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en perfil.controller:", error);

    const data = HomeModel.getHomeData();

    res.render("perfil/index", {
      title: "Mi cuenta",
      topNav: data.topNav,
      activePath: null,
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: []
    });
  }
};