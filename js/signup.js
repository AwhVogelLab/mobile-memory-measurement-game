async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
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
