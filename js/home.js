import { supabase } from "./SupabaseClient.js";

const playButton = document.querySelector(".play_button");

const { data: { user } } = await supabase.auth.getUser();

playButton.addEventListener("click", () => {
    window.location.href = "/play/";
});

if (!user) {
  window.location.href = "/landing_page/";
}