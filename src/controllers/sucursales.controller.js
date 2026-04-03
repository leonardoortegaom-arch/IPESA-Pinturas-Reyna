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

    const sucursal = {
      nombre: "IPESA Pinturas Reyna",
      direccion: "4ta Av. No. 293, Benito Juárez, C.P. 57000, Nezahualcóyotl, Estado de México",
      telefonos: ["56 1515 5500", "55 3179 2053"],
      horario: "Lunes a viernes de 8:00 a.m. a 7:00 p.m.",
      coordenadas: {
        lat: 19.4007642,
        lng: -98.9901163
      },
      mapsUrl: "https://maps.app.goo.gl/8p3ynUyFKgWJGYpu5",
      referencia: "Ubicación comercial de IPESA cerca de Plaza Neza"
    };

    res.render("sucursales/index", {
      title: "Sucursal | IPESA Pinturas Reyna",
      topNav: data.topNav,
      activePath: "/sucursales",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || []),
      sucursal
    });
  } catch (error) {
    console.error("Error en sucursales.controller:", error);

    const data = HomeModel.getHomeData();

    const sucursal = {
      nombre: "IPESA Pinturas Reyna",
      direccion: "4ta Av. No. 293, Benito Juárez, C.P. 57000, Nezahualcóyotl, Estado de México",
      telefonos: ["56 1515 5500", "55 3179 2053"],
      horario: "Lunes a viernes de 8:00 a.m. a 7:00 p.m.",
      coordenadas: {
        lat: 19.4007642,
        lng: -98.9901163
      },
      mapsUrl: "https://maps.app.goo.gl/8p3ynUyFKgWJGYpu5",
      referencia: "Ubicación comercial de IPESA en Plaza Neza, mostrada al usuario como IPESA Pinturas Reyna."
    };

    res.render("sucursales/index", {
      title: "Sucursal | IPESA Pinturas Reyna",
      topNav: data.topNav,
      activePath: "/sucursales",
      disableSearchSubmit: false,
      searchInputId: "searchInput",
      searchQuery: "",
      searchProducts: [],
      sucursal
    });
  }
};