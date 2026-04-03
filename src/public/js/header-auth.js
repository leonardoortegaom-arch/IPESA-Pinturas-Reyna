import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const accountLink = document.getElementById("accountLink");
const accountText = document.getElementById("accountText");
const accountHello = document.getElementById("accountHello");

const favLink = document.getElementById("favLink");

const accountMenu = document.getElementById("accountMenu");
const accountWrap = document.getElementById("accountWrap");
const logoutBtn = document.getElementById("logoutBtn");

let isLogged = false;

onAuthStateChanged(auth, async (user) => {
  isLogged = !!user;

  if (!user) {
    // UI logged out
    if (accountLink) accountLink.href = "/login";
    if (accountHello) accountHello.textContent = "Hola";
    if (accountText) accountText.textContent = "Inicia sesión";

    if (accountMenu) accountMenu.style.display = "none";

    if (favLink) favLink.href = "/login";
    return;
  }

  // UI logged in
  if (accountLink) accountLink.href = "/perfil";
  if (favLink) favLink.href = "/perfil#favoritos";

  // Traer nombre desde RTDB: usuarios/{uid}
  try {
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    const data = snap.exists() ? snap.val() : null;

    const fullName = (data?.nombre || "").trim();
    const firstName = fullName ? fullName.split(" ")[0] : (user.email ? user.email.split("@")[0] : "Usuario");

    if (accountHello) accountHello.textContent = `Hola, ${firstName}`;
    if (accountText) accountText.textContent = "Mi cuenta";
  } catch (e) {
    // fallback si falla RTDB
    const fallback = user.email ? user.email.split("@")[0] : "Usuario";
    if (accountHello) accountHello.textContent = `Hola, ${fallback}`;
    if (accountText) accountText.textContent = "Mi cuenta";
  }

  // Mostrar dropdown disponible
  if (accountMenu) accountMenu.style.display = "none"; // cerrado por defecto
});

// Toggle dropdown al hacer click en el bloque de cuenta cuando está logueado
if (accountWrap && accountMenu) {
  accountWrap.addEventListener("click", (e) => {
    if (!isLogged) return;

    // ✅ Si el click fue en un link del dropdown, deja que navegue normal
    const clickedLink = e.target.closest("#accountMenu a");
    if (clickedLink) {
      accountMenu.style.display = "none"; // opcional: cerrar menú al navegar
      return; // NO preventDefault
    }

    // ✅ Si el click fue en el botón "Cerrar sesión", no navegues
    const clickedLogout = e.target.closest("#logoutBtn");
    if (clickedLogout) return;

    // ✅ Solo evitar navegación cuando clickeas el “botón de cuenta”
    const clickedAccountLink = e.target.closest("#accountLink");
    if (clickedAccountLink) {
      e.preventDefault();
      const isOpen = accountMenu.style.display === "block";
      accountMenu.style.display = isOpen ? "none" : "block";
    }
  });

  // Cerrar menú al dar click afuera
  document.addEventListener("click", (e) => {
    if (!accountMenu || accountMenu.style.display !== "block") return;
    if (!accountWrap.contains(e.target)) accountMenu.style.display = "none";
  });
}

// Cerrar dropdown al seleccionar un link
const accountMenuLinks = document.querySelectorAll("#accountMenu a");
accountMenuLinks.forEach(a => {
  a.addEventListener("click", () => {
    const m = document.getElementById("accountMenu");
    if (m) m.style.display = "none";
  });
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await signOut(auth);
    window.location.href = "/";
  });
}