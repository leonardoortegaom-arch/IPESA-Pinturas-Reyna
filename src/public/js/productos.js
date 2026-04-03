import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

(function () {
  function $(id){ return document.getElementById(id); }

  function normalize(s){ return (s||"").toString().toLowerCase().trim(); }

  function money(n){
    try { return Number(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch { return String(n); }
  }

  const grid = $("productGrid");
  if(!grid) return;

  const searchInput = $("searchInput");
  const categorySelect = $("categorySelect");
  const useSelect = $("useSelect");
  const sortSelect = $("sortSelect");
  const resetBtn = $("resetFilters");
  const chips = $("chips");

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const modal = $("quickModal");
  const qmImg = $("qmImg");
  const qmTitle = $("qmTitle");
  const qmDesc = $("qmDesc");
  const qmTag = $("qmTag");
  const qmPres = $("qmPres");
  const qmColors = $("qmColors");
  const qmPrice = $("qmPrice");
  const qmStock = $("qmStock");
  const qmAdd = $("qmAdd");
  const qmFicha = $("qmFicha");

  let modalProduct = null;
  let currentUid = null;
  let favoritosMap = {};

  function openModal(product){
    modalProduct = product;
    qmImg.src = product.img;
    qmImg.alt = product.nombre;
    qmTitle.textContent = product.nombre;
    qmDesc.textContent = product.descripcion;
    qmTag.textContent = product.etiqueta;
    qmPres.textContent = product.presentacion;
    qmColors.textContent = String(product.colores);
    qmPrice.textContent = `$ ${money(product.precio)}`;
    qmStock.textContent = `${product.stock} unidades`;

    if (product.fichaTecnicaUrl) {
      qmFicha.href = product.fichaTecnicaUrl;
      qmFicha.style.display = "";
    } else {
      qmFicha.href = "#";
      qmFicha.style.display = "none";
    }

    qmAdd.disabled = Number(product.stock || 0) <= 0;
    qmAdd.textContent = Number(product.stock || 0) > 0 ? "Agregar al carrito" : "Sin stock";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
  }

  function closeModal(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    modalProduct = null;
  }

  modal?.querySelectorAll("[data-close]")?.forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

  qmAdd?.addEventListener("click", () => {
    if(!modalProduct) return;
    if(Number(modalProduct.stock || 0) <= 0) return;

    window.Cart?.addItem({
      id: modalProduct.id,
      name: modalProduct.nombre,
      price: modalProduct.precio,
      img: modalProduct.img,
      pres: modalProduct.presentacion,
    });
    closeModal();
  });

  const cards = Array.from(grid.querySelectorAll(".card"));

  function setActiveChip(key){
    if(!chips) return;
    chips.querySelectorAll(".chip").forEach(c => {
      c.classList.toggle("chip--active", c.getAttribute("data-chip") === key);
    });
  }

  function apply(){
    const q = normalize(searchInput?.value);
    const cat = categorySelect?.value || "all";
    const use = useSelect?.value || "all";

    let visible = cards.filter(card => {
      const name = card.getAttribute("data-name") || "";
      const c = card.getAttribute("data-cat") || "";
      const u = card.getAttribute("data-use") || "";

      const okQ = !q || name.includes(q);
      const okC = cat === "all" || c === cat;
      const okU = use === "all" || u === use;
      return okQ && okC && okU;
    });

    const sort = sortSelect?.value || "featured";
    if(sort === "az"){
      visible.sort((a,b)=> (a.getAttribute("data-name")||"").localeCompare(b.getAttribute("data-name")||""));
    } else if(sort === "za"){
      visible.sort((a,b)=> (b.getAttribute("data-name")||"").localeCompare(a.getAttribute("data-name")||""));
    } else if(sort === "pLow"){
      visible.sort((a,b)=> (+a.getAttribute("data-price")) - (+b.getAttribute("data-price")));
    } else if(sort === "pHigh"){
      visible.sort((a,b)=> (+b.getAttribute("data-price")) - (+a.getAttribute("data-price")));
    }

    cards.forEach(c => c.style.display = "none");
    visible.forEach(c => {
      c.style.display = "";
      grid.appendChild(c);
    });
  }

  function updateFavoriteButtonsUI() {
    cards.forEach(card => {
      const productId = card.getAttribute("data-id");
      const btn = card.querySelector("[data-fav-btn]");
      if (!btn) return;

      const isFav = !!favoritosMap[productId];
      btn.classList.toggle("is-active", isFav);
      btn.textContent = isFav ? "♥" : "♡";
      btn.setAttribute("aria-label", isFav ? "Quitar de favoritos" : "Agregar a favoritos");
      btn.setAttribute("title", isFav ? "Quitar de favoritos" : "Agregar a favoritos");
    });
  }

  async function loadFavorites(uid) {
    try {
      const snap = await get(ref(db, `usuarios/${uid}/favoritos`));
      favoritosMap = snap.exists() ? snap.val() : {};
      updateFavoriteButtonsUI();
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    }
  }

  async function toggleFavorite(productId) {
    if (!currentUid) {
      alert("Debes iniciar sesión para guardar favoritos.");
      return;
    }

    const favRef = ref(db, `usuarios/${currentUid}/favoritos/${productId}`);

    try {
      if (favoritosMap[productId]) {
        await remove(favRef);
        delete favoritosMap[productId];
      } else {
        await set(favRef, true);
        favoritosMap[productId] = true;
      }

      updateFavoriteButtonsUI();
    } catch (error) {
      console.error("Error actualizando favorito:", error);
      alert("No se pudo actualizar favoritos.");
    }
  }

  searchInput?.addEventListener("input", apply);
  categorySelect?.addEventListener("change", () => {
    setActiveChip(categorySelect.value === "all" ? "all" : categorySelect.value);
    apply();
  });
  useSelect?.addEventListener("change", apply);
  sortSelect?.addEventListener("change", apply);

  resetBtn?.addEventListener("click", () => {
    if(searchInput) searchInput.value = "";
    if(categorySelect) categorySelect.value = "all";
    if(useSelect) useSelect.value = "all";
    if(sortSelect) sortSelect.value = "featured";
    setActiveChip("all");
    apply();
  });

  chips?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if(!btn) return;
    const key = btn.getAttribute("data-chip");
    setActiveChip(key);
    if(categorySelect) categorySelect.value = key === "all" ? "all" : key;
    apply();
  });

  grid.addEventListener("click", (e) => {
    const quick = e.target.closest("[data-quick]");
    const add = e.target.closest("[data-add]");
    const fav = e.target.closest("[data-fav-btn]");
    const card = e.target.closest(".card");
    if(!card) return;

    const product = {
      id: card.getAttribute("data-id"),
      nombre: card.querySelector(".card__title")?.textContent?.trim() || "",
      categoria: card.getAttribute("data-cat"),
      uso: card.getAttribute("data-use"),
      presentacion: card.getAttribute("data-pres"),
      etiqueta: card.getAttribute("data-label"),
      precio: Number(card.getAttribute("data-price") || 0),
      colores: Number(card.getAttribute("data-colors") || 0),
      stock: Number(card.getAttribute("data-stock") || 0),
      descripcion: (card.getAttribute("data-desc") || "").replace(/&quot;/g,'"'),
      img: card.getAttribute("data-img") || "/img/product.svg",
      fichaTecnicaUrl: card.getAttribute("data-ficha") || "",
    };

    if (fav) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product.id);
      return;
    }

    if(quick){
      openModal(product);
    }

    if(add){
  if(product.stock <= 0) return;

  window.Cart?.addItem({
    id: add.dataset.id || product.id,
    name: add.dataset.name || product.nombre,
    price: Number(add.dataset.price || product.precio || 0),
    img: add.dataset.img || product.img,
    pres: add.dataset.pres || product.presentacion,
    qty: 1
  });
}
  });

  onAuthStateChanged(auth, async (user) => {
    currentUid = user?.uid || null;
    favoritosMap = {};

    if (currentUid) {
      await loadFavorites(currentUid);
    } else {
      updateFavoriteButtonsUI();
    }
  });

  apply();
})();