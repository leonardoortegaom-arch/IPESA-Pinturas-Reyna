const express = require("express");
const router = express.Router();
const coloresController = require("../controllers/colores.controller");

router.get("/", coloresController.index);

module.exports = router;
