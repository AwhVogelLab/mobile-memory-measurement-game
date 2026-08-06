import { supabase } from "./SupabaseClient.js";

async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("Login failed:", error.message);
    return null;
  }
  return data.user;
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = await logIn(email, password);

    if (user) {
        window.location.href = "/play/index.html";
    }
});