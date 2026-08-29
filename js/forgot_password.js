import { supabase } from "./SupabaseClient.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://trackmymemory.com/",
});

    if (error) {
        console.error("Reset request failed:", error.message);
        document.getElementById("status").textContent = "Something went wrong. Try again.";
        return;
    }

    document.getElementById("status").textContent = "Check your email for a reset link.";
});