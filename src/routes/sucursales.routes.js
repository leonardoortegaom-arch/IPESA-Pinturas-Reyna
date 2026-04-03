const router = require("express").Router();
const ctrl = require("../controllers/sucursales.controller");

router.get("/", ctrl.index);

module.exports = router;