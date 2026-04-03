const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productos.controller");


router.get("/api/favoritos", productosController.getFavoritos);
router.get("/", productosController.index);
router.get("/:id", productosController.detail);

module.exports = router;