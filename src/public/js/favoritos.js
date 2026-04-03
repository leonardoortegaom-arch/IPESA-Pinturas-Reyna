import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

let currentUid = null;
let favoritosMap = {};

function getFavoriteIds() {
  return Object.keys(favoritosMap).filter((id) => favoritosMap[id]);
}

function updateCatalogFavoriteButtons() {
  const cards = document.querySelectorAll(".card[data-id]");

  cards.forEach((card) => {
    const productId = String(card.getAttribute("data-id") || "").trim();
    const btn = card.querySelector("[data-fav-btn]");
    if (!btn || !productId) return;

    const isFav = !!favoritosMap[productId];

    btn.classList.toggle("is-active", isFav);
    btn.textContent = isFav ? "♥" : "♡";
    btn.setAttribute("aria-label", isFav ? "Quitar de favoritos" : "Agregar a favoritos");
    btn.setAttribute("title", isFav ? "Quitar de favoritos" : "Agregar a favoritos");
  });
}

function updateDetailFavoriteButton() {
  const btn = document.getElementById("detailFavBtn");
  if (!btn) return;

  const productId = String(btn.dataset.id || "").trim();
  if (!productId) return;

  const isFav = !!favoritosMap[productId];
  const icon = btn.querySelector(".detailFavBtn__icon");
  const text = btn.querySelector(".detailFavBtn__text");

  btn.classList.toggle("is-active", isFav);
  btn.setAttribute("aria-label", isFav ? "Quitar de favoritos" : "Agregar a favoritos");
  btn.setAttribute("title", isFav ? "Quitar de favoritos" : "Agregar a favoritos");

  if (icon) icon.textContent = isFav ? "♥" : "♡";
  if (text) text.textContent = isFav ? "Quitar de favoritos" : "Agregar a favoritos";
}

function updateAllFavoriteButtons() {
  updateCatalogFavoriteButtons();
  updateDetailFavoriteButton();
}

async function loadFavorites(uid) {
  try {
    const snap = await get(ref(db, `usuarios/${uid}/favoritos`));
    favoritosMap = snap.exists() ? snap.val() : {};
    updateAllFavoriteButtons();
    await renderFavoritesPanel();
  } catch (error) {
    console.error("Error al cargar favoritos:", error);
  }
}

async function toggleFavorite(productId) {
  const cleanId = String(productId || "").trim();
  if (!cleanId) return;

  if (!currentUid) {
    alert("Debes iniciar sesión para guardar favoritos.");
    return;
  }

  const favRef = ref(db, `usuarios/${currentUid}/favoritos/${cleanId}`);

  try {
    if (favoritosMap[cleanId]) {
      await remove(favRef);
      delete favoritosMap[cleanId];
    } else {
      await set(favRef, true);
      favoritosMap[cleanId] = true;
    }

    updateAllFavoriteButtons();
    await renderFavoritesPanel();
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    alert("No se pudo actualizar favoritos.");
  }
}

async function fetchFavoriteProducts(ids = []) {
  if (!Array.isArray(ids) || !ids.length) return [];

  try {
    const query = encodeURIComponent(ids.join(","));
    const res = await fetch(`/productos/api/favoritos?ids=${query}`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.message || "No se pudieron cargar los favoritos.");
    }

    return Array.isArray(data.productos) ? data.productos : [];
  } catch (error) {
    console.error("Error al consultar productos favoritos:", error);
    return [];
  }
}

function createFavoriteCard(producto) {
  const article = document.createElement("article");
  article.className = "favoriteCard";

  const precio = Number(producto.precio || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  article.innerHTML = `
    <a href="/productos/${producto.id}" class="favoriteCard__imgWrap">
      <img src="${producto.img || "/img/product.svg"}" alt="${producto.nombre}" class="favoriteCard__img">
    </a>

    <div class="favoriteCard__body">
      <p class="favoriteCard__linea">${producto.linea || ""}</p>
      <a href="/productos/${producto.id}" class="favoriteCard__title">${producto.nombre || "Producto"}</a>
      <div class="favoriteCard__price">$ ${precio}</div>

      <div class="favoriteCard__actions">
        <a href="/productos/${producto.id}" class="btnGhost">Ver producto</a>
        <button type="button" class="btnGhost favoriteCard__remove" data-remove-fav="${producto.id}">
          Quitar
        </button>
      </div>
    </div>
  `;

  return article;
}

async function renderFavoritesPanel() {
  const panel = document.getElementById("panel-favoritos");
  if (!panel) return;

  const card = panel.querySelector(".card");
  if (!card) return;

  const ids = getFavoriteIds();

  if (!ids.length) {
    card.innerHTML = `
      <p class="muted">Aquí aparecerán tus productos guardados.</p>
      <p><b>Aún no has agregado productos a favoritos.</b></p>
    `;
    return;
  }

  card.innerHTML = `<p>Cargando favoritos...</p>`;

  const productos = await fetchFavoriteProducts(ids);

  if (!productos.length) {
    card.innerHTML = `
      <p class="muted">Aquí aparecerán tus productos guardados.</p>
      <p><b>No se pudieron cargar tus favoritos.</b></p>
    `;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "favoritesGrid";

  productos.forEach((producto) => {
    wrapper.appendChild(createFavoriteCard(producto));
  });

  card.innerHTML = `
    <p class="muted">Aquí aparecerán tus productos guardados.</p>
  `;
  card.appendChild(wrapper);

  card.querySelectorAll("[data-remove-fav]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.getAttribute("data-remove-fav");
      await toggleFavorite(productId);
    });
  });
}

function setupCatalogEvents() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.addEventListener("click", async (e) => {
    const favBtn = e.target.closest("[data-fav-btn]");
    if (!favBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = favBtn.closest(".card");
    if (!card) return;

    const productId = card.getAttribute("data-id");
    await toggleFavorite(productId);
  });
}

function setupDetailEvents() {
  const detailFavBtn = document.getElementById("detailFavBtn");
  if (!detailFavBtn) return;

  detailFavBtn.addEventListener("click", async () => {
    const productId = detailFavBtn.dataset.id;
    await toggleFavorite(productId);
  });
}

onAuthStateChanged(auth, async (user) => {
  currentUid = user?.uid || null;
  favoritosMap = {};

  updateAllFavoriteButtons();

  if (currentUid) {
    await loadFavorites(currentUid);
  } else {
    await renderFavoritesPanel();
  }
});

setupCatalogEvents();
setupDetailEvents();