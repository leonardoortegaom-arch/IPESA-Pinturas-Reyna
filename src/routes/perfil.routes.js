const router = require("express").Router();
const PerfilController = require("../controllers/perfil.controller");

router.get("/", PerfilController.index);

module.exports = router;