(function () {
  const grid = document.getElementById("colorsGrid");
  const modal = document.getElementById("colorModal");
  const mName = document.getElementById("mName");
  const mCode = document.getElementById("mCode");
  const mSwatch = document.getElementById("mSwatch");
  const mClose = document.getElementById("mClose");
  const copyBtn = document.getElementById("copyBtn");
  const copyMsg = document.getElementById("copyMsg");

  let currentCode = "";

  function openModal({ nombre, codigo, hex }) {
    currentCode = codigo || "";
    if (mName) mName.textContent = nombre || "Color";
    if (mCode) mCode.textContent = `Código: ${codigo || ""}`;
    if (mSwatch) mSwatch.style.background = hex || "#fff";

    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden", "false");
    if (copyMsg) copyMsg.textContent = "";
  }

  function closeModal() {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
  }

  grid?.addEventListener("click", (e) => {
    const card = e.target.closest(".colorCard");
    if (!card) return;

    openModal({
      nombre: card.dataset.nombre,
      codigo: card.dataset.codigo,
      hex: card.dataset.hex,
    });
  });

  mClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      if (copyMsg) copyMsg.textContent = "Copiado ✅";
    } catch {
      if (copyMsg) copyMsg.textContent = "No se pudo copiar.";
    }
  });
})();
