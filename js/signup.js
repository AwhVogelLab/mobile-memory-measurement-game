import { supabase } from "./SupabaseClient.js";
const { data: { user } } = await supabase.auth.getUser();

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const errorMessage = document.getElementById("signupError");
    if (errorMessage) {
        errorMessage.style.display = "block";
        errorMessage.textContent = error.message;
    }
    console.error("Sign up failed:", error.message);
    return null;
  }
  return data.user; // data.user.id is this player's unique ID going forward
}

async function createPlayerRow(userId, displayName) {
  const { data, error } = await supabase
    .from("players")
    .insert({ player_id: userId, display_name: displayName })
    .select();
  if (error) {
    console.error("Creating player row failed:", error.message);
    return null;
  }
  
  return data[0];
}

document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = await signUp(email, password);

    if (!user) return; // signUp already logged the error

    await createPlayerRow(user.id, email); // using email as display_name for now

    const successMessage = document.getElementById("signupSuccess");

    successMessage.style.display = "block";
    successMessage.textContent =
        `Account created! Please check ${email} for a verification email.`;

    console.log("Verification email sent to:", email);

    // window.location.href = "/index.html"; // adjust to wherever standard/freeplay actually lives
});

if (user) {
  window.location.href = "/";
}