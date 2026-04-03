import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password); // :contentReference[oaicite:7]{index=7}
    window.location.href = "/";
  } catch (err) {
    msg.textContent = humanFirebaseError(err);
  }
});

function humanFirebaseError(err) {
  const code = err?.code || "";
  if (code.includes("auth/invalid-credential")) return "Correo o contraseña incorrectos.";
  if (code.includes("auth/invalid-email")) return "Correo inválido.";
  return "Ocurrió un error. Intenta de nuevo.";
}