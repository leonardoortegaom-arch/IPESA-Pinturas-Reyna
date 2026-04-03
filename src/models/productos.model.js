const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://eobifjvmajyyudlqupwq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qm0S6_221Im0SD0IQnrMFg_qJK8XNx8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function normalizeCategory(linea = "") {
  const value = linea.toString().toLowerCase().trim();

  if (value.includes("vin")) return "vinilicas";
  if (value.includes("esm")) return "esmaltes";
  if (value.includes("sell")) return "selladores";
  if (value.includes("auto")) return "automotriz";
  if (value.includes("recubr")) return "recubrimientos";

  return "vinilicas";
}

function formatUso(descripcion = "", linea = "") {
  const text = `${descripcion} ${linea}`.toLowerCase();

  if (text.includes("interior") && text.includes("exterior")) return "interior_exterior";
  if (text.includes("exterior")) return "exterior";
  if (text.includes("interior")) return "interior";

  return "interior_exterior";
}

function formatPresentacion(capacidades) {
  if (!Array.isArray(capacidades) || capacidades.length === 0) return "Sin especificar";
  return capacidades.join(" · ");
}

function formatEtiqueta(acabados, atributos) {
  if (Array.isArray(acabados) && acabados.length > 0) return acabados[0];
  if (Array.isArray(atributos) && atributos.length > 0) return atributos[0];
  return "Disponible";
}

function transformProduct(p) {
  return {
    id: p.id,
    nombre: p.nombre || "Producto",
    categoria: normalizeCategory(p.linea),
    uso: formatUso(p.descripcion, p.linea),
    presentacion: formatPresentacion(p.capacidades),
    etiqueta: formatEtiqueta(p.acabados, p.atributos),
    precio: Number(p.precio || 0),
    stock: Number(p.stock || 0),
    img: p.imagen_url || "/img/product.svg",
    descripcion: p.descripcion || "Sin descripción disponible.",
    colores: Array.isArray(p.colores) ? p.colores : [],
    fichaTecnicaUrl: p.ficha_tecnica_url || "",
    fichaColoresUrl: p.ficha_colores_url || "",
    hojaSeguridadUrl: p.hoja_seguridad_url || "",
    linea: p.linea || "",
    acabados: Array.isArray(p.acabados) ? p.acabados : [],
    atributos: Array.isArray(p.atributos) ? p.atributos : [],
    capacidades: Array.isArray(p.capacidades) ? p.capacidades : [],
  };
}

exports.getProductosData = async () => {
  const categorias = [
    { key: "vinilicas", label: "Vinílicas" },
    { key: "esmaltes", label: "Esmaltes" },
    { key: "selladores", label: "Selladores" },
    { key: "automotriz", label: "Automotriz" },
    { key: "recubrimientos", label: "Recubrimientos" },
  ];

  const usos = [
    { key: "interior", label: "Interior" },
    { key: "exterior", label: "Exterior" },
    { key: "interior_exterior", label: "Interior/Exterior" },
  ];

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("actualizado_en", { ascending: false });

  if (error) {
    console.error("Error al obtener productos:", error);
    return {
      title: "Productos | IPESA",
      categorias,
      usos,
      productos: [],
    };
  }

  return {
    title: "Productos | IPESA",
    categorias,
    usos,
    productos: (data || []).map(transformProduct),
  };
};

exports.getProductoById = async (id) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error al obtener producto por id:", error);
    return null;
  }

  return transformProduct(data);
};

exports.getProductosByIds = async (ids = []) => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    const idsLimpios = ids
      .map(id => String(id).trim())
      .filter(Boolean);

    if (!idsLimpios.length) {
      return [];
    }

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .in("id", idsLimpios);

    if (error) {
      console.error("Error al obtener productos por ids:", error);
      return [];
    }

    return (data || []).map(transformProduct);
  } catch (error) {
    console.error("Error en getProductosByIds:", error);
    return [];
  }
};

