(function () {
  const LS_KEY = "ipesa_cart_v1";

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  function money(n) {
    try {
      return Number(n || 0).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch {
      return String(n || 0);
    }
  }

  function getBadgeEl() { return document.getElementById("cartBadge"); }
  function getDrawerEl() { return document.getElementById("cartDrawer"); }
  function getItemsEl() { return document.getElementById("cartItems"); }
  function getTotalEl() { return document.getElementById("cartTotal"); }
  function getSubtotalEl() { return document.getElementById("cartSubtotal"); }
  function getCountEl() { return document.getElementById("cartCountText"); }
  function getEmptyActionsEl() { return document.getElementById("cartEmptyActions"); }

  function calcCount(items) {
    return items.reduce((a, it) => a + (Number(it.qty) || 0), 0);
  }

  function calcTotal(items) {
    return items.reduce((a, it) => a + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  }

  function updateBadge(items) {
    const badge = getBadgeEl();
    if (!badge) return;

    const count = calcCount(items);
    badge.textContent = String(count);
    badge.style.display = count > 0 ? "grid" : "none";
  }

  function updateSummary(items) {
    const subtotal = calcTotal(items);
    const totalEl = getTotalEl();
    const subtotalEl = getSubtotalEl();
    const countEl = getCountEl();
    const emptyActions = getEmptyActionsEl();

    if (subtotalEl) subtotalEl.textContent = `$ ${money(subtotal)}`;
    if (totalEl) totalEl.textContent = `$ ${money(subtotal)}`;

    if (countEl) {
      const count = calcCount(items);
      countEl.textContent = count === 1 ? "1 producto" : `${count} productos`;
    }

    if (emptyActions) {
      emptyActions.style.display = items.length ? "flex" : "none";
    }
  }

  function renderDrawer(items) {
    const list = getItemsEl();
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = `
        <div class="emptyCart">
          <div class="emptyCart__icon">🛒</div>
          <p><strong>Tu carrito está vacío.</strong></p>
          <p class="muted">Agrega productos para verlos aquí.</p>
        </div>
      `;
      updateSummary(items);
      return;
    }

    list.innerHTML = items.map(it => {
      const qty = Number(it.qty || 1);
      const price = Number(it.price || 0);
      const subtotal = qty * price;

      return `
        <div class="cartItem" data-id="${it.id}">
          <div class="cartItem__media">
            <img class="cartItem__img" src="${it.img || "/img/product.svg"}" alt="${it.name || "Producto"}">
          </div>

          <div class="cartItem__info">
            <div class="cartItem__top">
              <div>
                <div class="cartItem__name">${it.name || "Producto"}</div>
                <div class="cartItem__meta muted">${it.pres || "Sin especificar"}</div>
              </div>

              <button class="qtyRemove" data-remove type="button" aria-label="Quitar producto">
                Quitar
              </button>
            </div>

            <div class="cartItem__bottom">
              <div class="cartItem__qty">
                <button class="qtyBtn" data-dec type="button">−</button>
                <span class="qtyVal">${qty}</span>
                <button class="qtyBtn" data-inc type="button">+</button>
              </div>

              <div class="cartItem__prices">
                <div class="cartItem__unit muted">Unitario: $ ${money(price)}</div>
                <div class="cartItem__subtotal">$ ${money(subtotal)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    updateSummary(items);

    list.querySelectorAll(".cartItem").forEach(row => {
      const id = row.getAttribute("data-id");
      row.querySelector("[data-inc]")?.addEventListener("click", () => changeQty(id, 1));
      row.querySelector("[data-dec]")?.addEventListener("click", () => changeQty(id, -1));
      row.querySelector("[data-remove]")?.addEventListener("click", () => removeItem(id));
    });
  }

  function openDrawer() {
    const drawer = getDrawerEl();
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    const drawer = getDrawerEl();
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function addItem(product) {
    const items = readCart();
    const found = items.find(i => String(i.id) === String(product.id));
    const qtyToAdd = Math.max(1, Number(product.qty || 1));

    if (found) {
      found.qty = Number(found.qty || 1) + qtyToAdd;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        img: product.img || "/img/product.svg",
        pres: product.pres || "",
        qty: qtyToAdd
      });
    }

    saveCart(items);
    updateBadge(items);
    renderDrawer(items);
    openDrawer();
  }

  function changeQty(id, delta) {
    const items = readCart();
    const it = items.find(i => String(i.id) === String(id));
    if (!it) return;

    it.qty = Math.max(1, Number(it.qty || 1) + delta);

    saveCart(items);
    updateBadge(items);
    renderDrawer(items);
  }

  function removeItem(id) {
    let items = readCart();
    items = items.filter(i => String(i.id) !== String(id));

    saveCart(items);
    updateBadge(items);
    renderDrawer(items);
  }

  function clearCart() {
    saveCart([]);
    updateBadge([]);
    renderDrawer([]);
  }

  async function handleCheckout() {
    const itemsNow = readCart();

    if (!itemsNow.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        alert("Aquí después conectaremos el flujo de compra.");
      } else {
        const goLogin = confirm("Debes iniciar sesión para continuar con la compra. ¿Deseas hacerlo?");
        if (goLogin) {
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Error verificando sesión:", error);
      alert("No se pudo verificar la sesión en este momento.");
    }
  }

  window.Cart = {
    addItem,
    openDrawer,
    closeDrawer,
    readCart,
    removeItem,
    clearCart
  };

  document.addEventListener("DOMContentLoaded", () => {
    const items = readCart();
    updateBadge(items);
    renderDrawer(items);

    document.getElementById("openCartBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
    });

    document.getElementById("closeCartBtn")?.addEventListener("click", closeDrawer);
    document.getElementById("cartBackdrop")?.addEventListener("click", closeDrawer);

    document.getElementById("clearCartBtn")?.addEventListener("click", () => {
      const itemsNow = readCart();
      if (!itemsNow.length) return;
      clearCart();
    });

    document.getElementById("goCheckoutBtn")?.addEventListener("click", handleCheckout);
    document.getElementById("checkoutBtn")?.addEventListener("click", handleCheckout);
  });
})();