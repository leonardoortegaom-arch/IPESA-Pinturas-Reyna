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

function buildHeroSlides(baseSlides = [], productos = []) {
  const productSlides = (productos || []).slice(0, 3).map((p) => ({
    badge: p.stock > 0 ? "Disponible" : "Agotado",
    kicker: p.linea || "Producto destacado",
    title: p.nombre,
    subtitle: p.descripcion || "Consulta detalles y documentación del producto.",
    desc: `Desde $${Number(p.precio || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} · ${p.stock > 0 ? `${p.stock} unidades disponibles` : "Sin stock por el momento"}`,
    cta1: { label: "Ver producto", href: `/productos/${p.id}` },
    cta2: { label: "Explorar catálogo", href: "/productos" },
    img: p.img || "/img/product.svg",
  }));

  return [...baseSlides.slice(0, 1), ...productSlides];
}

exports.home = async (req, res) => {
  try {
    const homeData = HomeModel.getHomeData();
    const productosData = await productosModel.getProductosData();

    const featuredProducts = (productosData.productos || []).slice(0, 4);
    const heroSlides = buildHeroSlides(homeData.heroSlides, productosData.productos || []);

    res.render("home/index", {
      ...homeData,
      heroSlides,
      featuredProducts,
      searchQuery: "",
      searchProducts: buildSearchProducts(productosData.productos || [])
    });
  } catch (error) {
    console.error("Error en home.controller:", error);

    const homeData = HomeModel.getHomeData();

    res.render("home/index", {
      ...homeData,
      featuredProducts: [],
      searchQuery: "",
      searchProducts: []
    });
  }
};