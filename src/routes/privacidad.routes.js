const router = require("express").Router();
const PrivacidadController = require("../controllers/privacidad.controller");

router.get("/", PrivacidadController.index);

module.exports = router;