const router = require("express").Router();
const TerminosController = require("../controllers/terminos.controller");

router.get("/", TerminosController.index);

module.exports = router;