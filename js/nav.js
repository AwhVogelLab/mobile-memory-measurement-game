import { supabase } from "./SupabaseClient.js";

console.log("JS FILE LOADED");

const signOutButton = document.getElementById("log-out");

console.log("Button:", signOutButton);

signOutButton.addEventListener("click", () => {
    handleSignOut();
});

async function handleSignOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error.message)
  } else {
    window.location.href = "/account/log_in";
    console.log('Successfully signed out')
  }
}
