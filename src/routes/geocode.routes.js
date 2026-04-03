const express = require("express");

const router = express.Router();

router.get("/api/geocode/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Faltan coordenadas." });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PinturasReynaApp/1.0"
      }
    });

    if (!response.ok) {
      return res.status(500).json({ message: "Error al consultar ubicación." });
    }

    const data = await response.json();
    const addr = data.address || {};

    const cp = addr.postcode || "";

    const estado =
      addr.state ||
      addr.region ||
      "";

    const municipio =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.municipality ||
      "";

    const colonia =
      addr.suburb ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.quarter ||
      "";

    const calle =
      addr.road ||
      addr.pedestrian ||
      addr.footway ||
      "";

    res.json({
      cp,
      estado,
      municipio,
      colonia,
      calle
    });
  } catch (error) {
    console.error("Error reverse geocode:", error);
    res.status(500).json({ message: "Error al obtener dirección." });
  }
});

module.exports = router;