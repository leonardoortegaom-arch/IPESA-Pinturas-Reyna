const data = window.__SUCURSALES__ || [];

const listEl = document.getElementById("branchList");
const searchEl = document.getElementById("branchSearch");
const estadoEl = document.getElementById("filterEstado");
const ciudadEl = document.getElementById("filterCiudad");
const nearMeBtn = document.getElementById("nearMeBtn");

const mapFrame = document.getElementById("mapFrame");
const mapTitle = document.getElementById("mapTitle");
const mapSub = document.getElementById("mapSub");

function uniq(arr){ return [...new Set(arr.filter(Boolean))].sort(); }

function setMap(s) {
  mapTitle.textContent = s.nombre;
  mapSub.textContent = s.direccion;
  mapFrame.src = `https://www.google.com/maps?q=${s.lat},${s.lng}&output=embed`;
}

function normalize(x){ return (x||"").toLowerCase().trim(); }

function render(filtered) {
  // ocultar/mostrar cards existentes (más simple que reconstruir)
  const cards = [...listEl.querySelectorAll(".branchCard")];
  const ids = new Set(filtered.map(x => x.id));
  cards.forEach(c => c.style.display = ids.has(c.dataset.id) ? "" : "none");
}

function applyFilters(){
  const q = normalize(searchEl.value);
  const est = normalize(estadoEl.value);
  const cty = normalize(ciudadEl.value);

  const filtered = data.filter(s => {
    const matchQ =
      !q ||
      normalize(s.nombre).includes(q) ||
      normalize(s.direccion).includes(q) ||
      normalize(s.ciudad).includes(q) ||
      normalize(s.estado).includes(q);

    const matchE = !est || normalize(s.estado) === est;
    const matchC = !cty || normalize(s.ciudad) === cty;
    return matchQ && matchE && matchC;
  });

  render(filtered);
}

function fillSelects(){
  const estados = uniq(data.map(x => x.estado));
  estados.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    estadoEl.appendChild(opt);
  });

  function fillCities(){
    const est = estadoEl.value;
    const ciudades = uniq(data.filter(x => !est || x.estado === est).map(x => x.ciudad));
    ciudadEl.innerHTML = `<option value="">Todas las ciudades</option>`;
    ciudades.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      ciudadEl.appendChild(opt);
    });
  }

  estadoEl.addEventListener("change", () => { fillCities(); applyFilters(); });
  ciudadEl.addEventListener("change", applyFilters);
  fillCities();
}

searchEl.addEventListener("input", applyFilters);

// Click en cards -> actualizar mapa
listEl.addEventListener("click", (e) => {
  const card = e.target.closest(".branchCard");
  if (!card) return;

  const act = e.target.closest("[data-action='ver']");
  if (!act && e.target.tagName === "A") return;

  const id = card.dataset.id;
  const s = data.find(x => x.id === id);
  if (s) setMap(s);
});

// Ubicación (opcional)
function haversineKm(a, b){
  const R = 6371;
  const dLat = (b.lat-a.lat) * Math.PI/180;
  const dLng = (b.lng-a.lng) * Math.PI/180;
  const sa = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(sa));
}

nearMeBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");
  navigator.geolocation.getCurrentPosition((pos) => {
    const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    const withDist = data.map(s => ({...s, dist: haversineKm(me, s)})).sort((a,b)=>a.dist-b.dist);
    const top = withDist[0];
    if (top) {
      setMap(top);
      alert(`Sucursal más cercana: ${top.nombre} (${top.dist.toFixed(1)} km)`);
    }
  }, () => alert("No se pudo obtener tu ubicación."), { enableHighAccuracy:true, timeout:8000 });
});

fillSelects();
applyFilters();