exports.getHomeData = () => {
  const topNav = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Colores", href: "/colores" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Sucursal", href: "/sucursales" },
  ];

  const heroSlides = [
    {
      kicker: "Pinturas Reyna · IPESA",
      subtitle: "Explora líneas decorativas, automotrices y productos especializados.",
      desc: "Consulta productos reales, disponibilidad, precios, documentación técnica y opciones visuales de compra desde una sola plataforma.",
      cta1: { label: "Ver productos", href: "/productos" },
      cta2: { label: "Conocer líneas", href: "/colores" },
    }
  ];

  return {
    title: "IPESA | Pinturas Reyna",
    topNav,
    heroSlides,
  };
};