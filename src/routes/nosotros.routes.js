const router = require("express").Router();
const NosotrosController = require("../controllers/nosotros.controller");

router.get("/", NosotrosController.index);

module.exports = router;