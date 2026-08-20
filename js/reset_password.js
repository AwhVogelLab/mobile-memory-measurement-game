import { supabase } from "./SupabaseClient.js";

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error("Password update failed:", error.message);
        document.getElementById("status").textContent = "Something went wrong. Try again.";
        return;
    }

    document.getElementById("status").textContent = "Password updated! You can log in now.";
    window.location.href = "/account/log_in/";
});