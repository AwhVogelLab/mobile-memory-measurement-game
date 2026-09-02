import { supabase } from "./SupabaseClient.js";

const signOutButton = document.getElementById("log-out");

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
