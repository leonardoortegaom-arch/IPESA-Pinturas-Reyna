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

    res.render("nosotros/index", {
      title: "Nosotros",
      topNav: data.topNav,
      activePath: "/nosotros",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en nosotros.controller:", error);

    const data = HomeModel.getHomeData();

    res.render("nosotros/index", {
      title: "Nosotros",
      topNav: data.topNav,
      activePath: "/nosotros",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: []
    });
  }
};