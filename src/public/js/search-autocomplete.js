(function () {
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");
  const products = Array.isArray(window.__SEARCH_PRODUCTS__) ? window.__SEARCH_PRODUCTS__ : [];

  if (!input || !resultsBox || !products.length) return;

  function normalize(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function clearResults() {
    resultsBox.innerHTML = "";
    resultsBox.classList.remove("is-open");
  }

  function renderResults(matches) {
    if (!matches.length) {
      clearResults();
      return;
    }

    resultsBox.innerHTML = matches.map(item => `
      <a class="search__result" href="/productos/${item.id}">
        <img class="search__resultImg" src="${item.img || "/img/product.svg"}" alt="${item.nombre}">
        <div class="search__resultBody">
          <strong class="search__resultTitle">${item.nombre}</strong>
          <span class="search__resultLine">${item.linea || ""}</span>
        </div>
      </a>
    `).join("");

    resultsBox.classList.add("is-open");
  }

  input.addEventListener("input", () => {
    const q = normalize(input.value);

    if (!q || q.length < 2) {
      clearResults();
      return;
    }

    const matches = products
      .filter(item => {
        const nombre = normalize(item.nombre);
        const linea = normalize(item.linea);
        return nombre.includes(q) || linea.includes(q);
      })
      .slice(0, 6);

    renderResults(matches);
  });

  input.addEventListener("focus", () => {
    const q = normalize(input.value);
    if (q.length < 2) return;

    const matches = products
      .filter(item => {
        const nombre = normalize(item.nombre);
        const linea = normalize(item.linea);
        return nombre.includes(q) || linea.includes(q);
      })
      .slice(0, 6);

    renderResults(matches);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search")) {
      clearResults();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearResults();
    }
  });
})();