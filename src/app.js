const express = require("express");
const path = require("path");

const app = express();

const geocodeRoutes = require("./routes/geocode.routes");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Views (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", require("./routes/home.routes"));
app.use("/", require("./routes/auth.routes"));
app.use("/perfil", require("./routes/perfil.routes"));
app.use("/profile", require("./routes/perfil.routes"));
app.use("/productos", require("./routes/productos.routes"));
app.use("/colores", require("./routes/colores.routes"));
app.use("/nosotros", require("./routes/nosotros.routes"));
app.use("/terminos", require("./routes/terminos.routes"));
app.use("/privacidad", require("./routes/privacidad.routes"));
app.use("/sucursales", require("./routes/sucursales.routes"));
app.use(geocodeRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("errors/404", { title: "No encontrado" });
});

module.exports = app;