import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // 1) Crear usuario en Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password); // email/pass auth :contentReference[oaicite:5]{index=5}
    const uid = cred.user.uid;

    // 2) Guardar datos extra en Realtime DB
    await set(ref(db, `usuarios/${uid}`), { // read/write RTDB :contentReference[oaicite:6]{index=6}
      nombre,
      telefono,
      email,
      creadoEn: Date.now()
    });

    // 3) Redirigir a perfil
    window.location.href = "/";
  } catch (err) {
    msg.textContent = humanFirebaseError(err);
  }
});

function humanFirebaseError(err) {
  const code = err?.code || "";
  if (code.includes("auth/email-already-in-use")) return "Ese correo ya está registrado.";
  if (code.includes("auth/weak-password")) return "La contraseña debe tener al menos 6 caracteres.";
  if (code.includes("auth/invalid-email")) return "Correo inválido.";
  return "Ocurrió un error. Intenta de nuevo.";
}