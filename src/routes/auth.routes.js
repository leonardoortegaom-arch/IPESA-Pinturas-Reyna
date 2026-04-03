const router = require("express").Router();

router.get("/login", (req, res) => res.render("auth/login"));
router.get("/register", (req, res) => res.render("auth/register"));
router.get("/perfil", (req, res) => res.render("profile/index"));

module.exports = router;