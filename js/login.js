import { supabase } from "./SupabaseClient.js";
const { data: { user } } = await supabase.auth.getUser();

async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const errorMessage = document.getElementById("loginError");
    if (errorMessage) {
        errorMessage.style.display = "block";
    }
    console.error("Login failed:", error.message);
    return null;
  }
  document.getElementById("loginError").style.display = "none";
  return data.user;
}

async function ensurePlayerRow(user) {
    const { data, error } = await supabase
        .from("players")
        .select("player_id")
        .eq("player_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Checking player row failed:", error.message);
        return;
    }

    if (!data) {
        const { error: insertError } = await supabase
            .from("players")
            .insert({ player_id: user.id, display_name: user.email });
        if (insertError) console.error("Creating player row failed:", insertError.message);
    }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = await logIn(email, password);

    if (user) {
        await ensurePlayerRow(user);
        window.location.href = "/index.html"; // adjust to match signup.js's redirect
    }
});

if (user) {
  window.location.href = "/";
}