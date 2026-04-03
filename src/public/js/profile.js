import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  reload
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const cuentaBox = document.getElementById("cuentaBox");
const logoutBtnProfile = document.getElementById("logoutBtnProfile");
const noticeCompletar = document.getElementById("noticeCompletar");

// ====== Modo lectura ======
const v_nombre = document.getElementById("v_nombre");
const v_telefono = document.getElementById("v_telefono");
const v_email = document.getElementById("v_email");
const v_domicilio = document.getElementById("v_domicilio");

// Forms por bloque
const editIdentidad = document.getElementById("edit_identidad");
const editDomicilio = document.getElementById("edit_domicilio");

// Inputs identidad
const pf_nombre = document.getElementById("pf_nombre");
const pf_telefono = document.getElementById("pf_telefono");

// Inputs domicilio
const pf_cp = document.getElementById("pf_cp");
const pf_calle = document.getElementById("pf_calle");
const pf_numExt = document.getElementById("pf_numExt");
const pf_sinNum = document.getElementById("pf_sinNum");
const pf_numInt = document.getElementById("pf_numInt");
const pf_colonia = document.getElementById("pf_colonia");
const pf_municipio = document.getElementById("pf_municipio");
const pf_estado = document.getElementById("pf_estado");
const pf_referencias = document.getElementById("pf_referencias");
const noCpBtn = document.getElementById("noCpBtn");
const useLocationBtn = document.getElementById("useLocationBtn");

// Seguridad
const emailStatus = document.getElementById("emailStatus");
const emailHint = document.getElementById("emailHint");
const sendVerificationBtn = document.getElementById("sendVerificationBtn");
const securityForm = document.getElementById("securityForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const securityMsg = document.getElementById("securityMsg");

// Mensajes
const pf_msg = document.getElementById("pf_msg");

// Panel switch
const sideItems = document.querySelectorAll(".accountSide__item");
const panels = document.querySelectorAll(".accountPanel");
const VALID = new Set(["perfil", "cuenta", "seguridad", "favoritos", "compras"]);

function getHashPanel() {
  const raw = (location.hash || "#perfil").replace("#", "").trim().toLowerCase();
  return VALID.has(raw) ? raw : "perfil";
}

function openPanel(name, { syncHash = true } = {}) {
  sideItems.forEach((b) => b.classList.toggle("is-active", b.dataset.panel === name));
  panels.forEach((p) => p.classList.toggle("is-active", p.id === `panel-${name}`));
  if (syncHash) history.replaceState(null, "", `${location.pathname}#${name}`);
}

sideItems.forEach((btn) =>
  btn.addEventListener("click", () => openPanel(btn.dataset.panel, { syncHash: true }))
);

window.addEventListener("hashchange", () => openPanel(getHashPanel(), { syncHash: false }));
openPanel(getHashPanel(), { syncHash: false });

let currentUid = null;
let currentCoords = {
  lat: null,
  lng: null
};

// ====== Helpers ======
function setMsg(text, type) {
  if (!pf_msg) return;
  pf_msg.textContent = text || "";
  pf_msg.classList.remove("ok", "err");
  if (type) pf_msg.classList.add(type);
}

function setSecurityMsg(text, type) {
  if (!securityMsg) return;
  securityMsg.textContent = text || "";
  securityMsg.classList.remove("ok", "err");
  if (type) securityMsg.classList.add(type);
}

function sanitizePhone(v) {
  return (v || "").replace(/[^\d+]/g, "").slice(0, 15);
}

function sanitizeCP(v) {
  return (v || "").replace(/[^\d]/g, "").slice(0, 5);
}

function buildDomicilioText(dom) {
  if (!dom) return "Aún no has agregado domicilio.";

  const parts = [
    dom.calle,
    dom.numExt ? `#${dom.numExt}` : (dom.sinNumero ? "S/N" : ""),
    dom.colonia,
    dom.municipio,
    dom.estado,
    dom.cp ? `CP ${dom.cp}` : ""
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Aún no has agregado domicilio.";
}

function fillReadOnlyUI(user, data) {
  if (v_nombre) v_nombre.textContent = data?.nombre || "—";
  if (v_telefono) v_telefono.textContent = data?.telefono || "—";
  if (v_email) v_email.textContent = user?.email || data?.email || "—";
  if (v_domicilio) v_domicilio.textContent = buildDomicilioText(data?.domicilio);
}

function updateEmailStatusUI(user) {
  if (!emailStatus || !user) return;

  emailStatus.classList.remove("ok", "err");

  if (user.emailVerified) {
    emailStatus.textContent = "Verificado ✅";
    emailStatus.classList.add("ok");
    if (emailHint) {
      emailHint.textContent = "Tu correo ya fue verificado.";
    }
    if (sendVerificationBtn) {
      sendVerificationBtn.disabled = true;
      sendVerificationBtn.textContent = "Correo ya verificado";
    }
  } else {
    emailStatus.textContent = "No verificado ❌";
    emailStatus.classList.add("err");
    if (emailHint) {
      emailHint.textContent = "Verifica tu correo para mayor seguridad en tu cuenta.";
    }
    if (sendVerificationBtn) {
      sendVerificationBtn.disabled = false;
      sendVerificationBtn.textContent = "Enviar correo de verificación";
    }
  }
}

// ====== Abrir / cerrar ediciones ======
document.querySelectorAll("[data-edit]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.edit;
    const box = document.getElementById(`edit_${key}`);
    if (box) box.style.display = "block";
    setMsg("");

    if (key === "domicilio" && pf_cp) {
      setTimeout(() => pf_cp.focus(), 50);
    }
  });
});

document.querySelectorAll("[data-cancel]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.cancel;
    const box = document.getElementById(`edit_${key}`);
    if (box) box.style.display = "none";
    setMsg("");
  });
});

// ====== UI: sin número ======
if (pf_sinNum && pf_numExt) {
  pf_sinNum.addEventListener("change", () => {
    const on = pf_sinNum.checked;
    pf_numExt.disabled = on;
    if (on) pf_numExt.value = "";
  });
}

// ====== Ubicación actual ======
async function fillAddressFromCoords(lat, lng) {
  try {
    setMsg("Obteniendo dirección desde tu ubicación...", "ok");

    currentCoords.lat = lat;
    currentCoords.lng = lng;

    const res = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "No se pudo obtener la dirección.");
    }

    if (pf_cp) pf_cp.value = sanitizeCP(data.cp || "");
    if (pf_estado) pf_estado.value = data.estado || "";
    if (pf_municipio) pf_municipio.value = data.municipio || "";
    if (pf_calle && !pf_calle.value.trim()) pf_calle.value = data.calle || "";
    if (pf_colonia && !pf_colonia.value.trim()) pf_colonia.value = data.colonia || "";

    setMsg("Ubicación cargada correctamente. Verifica los datos antes de guardar.", "ok");
  } catch (err) {
    console.error("fillAddressFromCoords:", err);
    setMsg("No se pudo obtener tu dirección desde la ubicación.", "err");
  }
}

function requestCurrentLocation() {
  if (!navigator.geolocation) {
    setMsg("Tu navegador no soporta geolocalización.", "err");
    return;
  }

  setMsg("Solicitando permiso de ubicación...", "ok");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      await fillAddressFromCoords(lat, lng);
    },
    (error) => {
      console.error("Geolocation error:", error);

      switch (error.code) {
        case 1:
          setMsg("Permiso de ubicación denegado por el usuario.", "err");
          break;
        case 2:
          setMsg("No se pudo determinar tu ubicación.", "err");
          break;
        case 3:
          setMsg("Se agotó el tiempo para obtener tu ubicación.", "err");
          break;
        default:
          setMsg("Ocurrió un error al obtener tu ubicación.", "err");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

if (pf_cp) {
  pf_cp.addEventListener("input", () => {
    pf_cp.value = sanitizeCP(pf_cp.value);
  });
}

if (noCpBtn) {
  noCpBtn.addEventListener("click", () => {
    window.open(
      "https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/Descarga.aspx",
      "_blank"
    );
  });
}

if (useLocationBtn) {
  useLocationBtn.addEventListener("click", requestCurrentLocation);
}

// ====== Seguridad ======
if (sendVerificationBtn) {
  sendVerificationBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await sendEmailVerification(user);
      setSecurityMsg("Correo de verificación enviado ✅ Revisa tu bandeja.", "ok");
    } catch (error) {
      console.error(error);
      setSecurityMsg("No se pudo enviar el correo de verificación.", "err");
    }
  });
}

if (securityForm) {
  securityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setSecurityMsg("");

    const user = auth.currentUser;
    if (!user || !user.email) {
      setSecurityMsg("No hay sesión activa.", "err");
      return;
    }

    const currentPassword = (currentPasswordInput?.value || "").trim();
    const newPassword = (newPasswordInput?.value || "").trim();
    const confirmPassword = (confirmPasswordInput?.value || "").trim();

    if (!currentPassword) {
      setSecurityMsg("Escribe tu contraseña actual.", "err");
      return;
    }

    if (!newPassword) {
      setSecurityMsg("Escribe tu nueva contraseña.", "err");
      return;
    }

    if (newPassword.length < 6) {
      setSecurityMsg("La nueva contraseña debe tener al menos 6 caracteres.", "err");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMsg("Las contraseñas no coinciden.", "err");
      return;
    }

    if (currentPassword === newPassword) {
      setSecurityMsg("La nueva contraseña no debe ser igual a la actual.", "err");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSecurityMsg("Contraseña actualizada correctamente ✅", "ok");

      if (securityForm) securityForm.reset();
    } catch (error) {
      console.error(error);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setSecurityMsg("La contraseña actual no es correcta.", "err");
      } else if (error.code === "auth/weak-password") {
        setSecurityMsg("La nueva contraseña es demasiado débil.", "err");
      } else if (error.code === "auth/requires-recent-login") {
        setSecurityMsg("Por seguridad, vuelve a iniciar sesión e inténtalo de nuevo.", "err");
      } else {
        setSecurityMsg("No se pudo actualizar la contraseña.", "err");
      }
    }
  });
}

// ====== Auth + cargar datos ======
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  currentUid = user.uid;

  if (cuentaBox) {
    cuentaBox.innerHTML = `
      <p><b>Correo:</b> ${user.email || "-"}</p>
      <p><b>UID:</b> ${user.uid}</p>
    `;
  }

  updateEmailStatusUI(user);

  try {
    await reload(user);
    updateEmailStatusUI(auth.currentUser || user);
  } catch (e) {
    console.error("No se pudo recargar el usuario:", e);
  }

  try {
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    const data = snap.exists() ? snap.val() : {};

    if (pf_nombre) pf_nombre.value = data.nombre || "";
    if (pf_telefono) pf_telefono.value = data.telefono || "";

    const dom = data?.domicilio || null;

    currentCoords.lat = dom?.lat ?? null;
    currentCoords.lng = dom?.lng ?? null;

    if (pf_cp) pf_cp.value = dom?.cp || "";
    if (pf_calle) pf_calle.value = dom?.calle || "";
    if (pf_sinNum) pf_sinNum.checked = !!dom?.sinNumero;
    if (pf_numExt) pf_numExt.value = dom?.numExt || "";
    if (pf_numInt) pf_numInt.value = dom?.numInt || "";
    if (pf_colonia) pf_colonia.value = dom?.colonia || "";
    if (pf_estado) pf_estado.value = dom?.estado || "";
    if (pf_municipio) pf_municipio.value = dom?.municipio || "";
    if (pf_referencias) pf_referencias.value = dom?.referencias || "";

    if (pf_sinNum && pf_numExt) {
      const on = pf_sinNum.checked;
      pf_numExt.disabled = on;
      if (on) pf_numExt.value = "";
    }

    fillReadOnlyUI(user, data);

    const faltaDom =
      !dom?.cp ||
      !dom?.calle ||
      (!dom?.sinNumero && !dom?.numExt) ||
      !dom?.colonia ||
      !dom?.municipio ||
      !dom?.estado;

    if (noticeCompletar) {
      noticeCompletar.style.display = faltaDom ? "block" : "none";
    }
  } catch (e) {
    console.error(e);
    setMsg("Error al cargar tu información.", "err");
  }
});

// ====== Guardar identidad ======
if (editIdentidad) {
  editIdentidad.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    if (!currentUid) return;

    const nombre = (pf_nombre?.value || "").trim();
    const telefono = sanitizePhone(pf_telefono?.value || "");

    if (!nombre) return setMsg("Escribe tu nombre y apellidos.", "err");
    if (!telefono) return setMsg("Escribe tu teléfono.", "err");

    const payload = {
      nombre,
      telefono,
      actualizadoEn: Date.now()
    };

    try {
      await update(ref(db, `usuarios/${currentUid}`), payload);

      if (v_nombre) v_nombre.textContent = nombre;
      if (v_telefono) v_telefono.textContent = telefono;
      if (v_email) v_email.textContent = auth.currentUser?.email || "—";

      setMsg("Cambios guardados ✅", "ok");
      editIdentidad.style.display = "none";
    } catch (e) {
      console.error(e);
      setMsg("No se pudo guardar. Revisa tu conexión o permisos.", "err");
    }
  });
}

// ====== Guardar domicilio ======
if (editDomicilio) {
  editDomicilio.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    if (!currentUid) return;

    const cp = sanitizeCP(pf_cp?.value || "");
    const calle = (pf_calle?.value || "").trim();
    const sinNumero = !!pf_sinNum?.checked;
    const numExt = sinNumero ? "" : (pf_numExt?.value || "").trim();
    const numInt = (pf_numInt?.value || "").trim();
    const colonia = (pf_colonia?.value || "").trim();
    const municipio = (pf_municipio?.value || "").trim();
    const estado = (pf_estado?.value || "").trim();
    const referencias = (pf_referencias?.value || "").trim();

    if (!cp) return setMsg("Ingresa tu código postal.", "err");
    if (cp.length !== 5) return setMsg("El código postal debe tener 5 dígitos.", "err");
    if (!calle) return setMsg("Ingresa tu calle.", "err");
    if (!sinNumero && !numExt) {
      return setMsg("Ingresa tu número externo o marca 'Sin número'.", "err");
    }
    if (!colonia) return setMsg("Ingresa tu colonia.", "err");
    if (!municipio) return setMsg("Completa tu municipio.", "err");
    if (!estado) return setMsg("Completa tu estado.", "err");

    const domicilio = {
      cp,
      calle,
      sinNumero,
      numExt,
      numInt,
      colonia,
      municipio,
      estado,
      referencias,
      lat: currentCoords.lat,
      lng: currentCoords.lng
    };

    try {
      await update(ref(db, `usuarios/${currentUid}`), {
        domicilio,
        actualizadoEn: Date.now()
      });

      if (v_domicilio) v_domicilio.textContent = buildDomicilioText(domicilio);
      if (noticeCompletar) noticeCompletar.style.display = "none";

      setMsg("Domicilio guardado ✅", "ok");
      editDomicilio.style.display = "none";
    } catch (e) {
      console.error(e);
      setMsg("No se pudo guardar. Revisa tu conexión o permisos.", "err");
    }
  });
}

// ====== Logout ======
if (logoutBtnProfile) {
  logoutBtnProfile.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  });
}