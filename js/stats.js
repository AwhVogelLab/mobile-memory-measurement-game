import { supabase } from "./SupabaseClient.js";

const shapeDisplayNames = {
    vertical_rectangle: "rectangle",
};

function getDisplayShapeName(shape) {
    return shapeDisplayNames[shape] ?? shape;
}

async function loadStats() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        console.error("No logged-in user found:", userError?.message);
        return;
    }

    const userId = userData.user.id;

    const { data: player, error: playerError } = await supabase
        .from("players")
        .select("current_streak")
        .eq("player_id", userId)
        .maybeSingle();

    if (playerError) {
        console.error("Loading player stats failed:", playerError.message);
    } else if (player) {
        document.querySelector("#number_days h2").textContent = player.current_streak ?? 0;
    }

    const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("final_points, num_correct")
        .eq("player_id", userId)
        .not("ended_at", "is", null);

    if (sessionsError) {
        console.error("Loading session stats failed:", sessionsError.message);
    } else if (sessions && sessions.length > 0) {
        const points = sessions.map(s => s.final_points ?? 0);
        const correctCounts = sessions.map(s => s.num_correct ?? 0);

        const highestScore = Math.max(...points);
        const averagePoints = Math.round(points.reduce((sum, p) => sum + p, 0) / points.length);
        const mostShapesCorrect = Math.max(...correctCounts);

        document.querySelector("#score_and_text h2").textContent = highestScore;
        document.querySelector("#pts_and_text h2").textContent = averagePoints;
        document.querySelector("#number_shapes h2").textContent = mostShapesCorrect;
    }

    await loadBestShapeAndColor(userId);
}


async function loadBestShapeAndColor(userId) {
    // Get all trial_objects where this player correctly identified the target,
    // by joining through trials -> sessions to filter by player
    const { data, error } = await supabase
        .from("trial_objects")
        .select("shape, color_hex, trials!inner(session_id, sessions!inner(player_id))")
        .eq("is_target", true)
        .eq("was_selected", true)
        .eq("trials.sessions.player_id", userId);

    if (error) {
        console.error("Loading best shape/color failed:", error.message);
        return;
    }

    if (!data || data.length === 0) return;

    // Count occurrences of each shape and color
    const shapeCounts = {};
    const colorCounts = {};

    data.forEach(row => {
        shapeCounts[row.shape] = (shapeCounts[row.shape] || 0) + 1;
        colorCounts[row.color_hex] = (colorCounts[row.color_hex] || 0) + 1;
    });

    const bestShape = Object.keys(shapeCounts).reduce((a, b) =>
        shapeCounts[a] > shapeCounts[b] ? a : b
    );
    const bestColor = Object.keys(colorCounts).reduce((a, b) =>
        colorCounts[a] > colorCounts[b] ? a : b
    );

    // Display them
    const displayName = getDisplayShapeName(bestShape);
    document.querySelector("#shape_and_name p").textContent =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);
    document.querySelector("#color_and_name p").textContent =
        bestColor.charAt(0).toUpperCase() + bestColor.slice(1);

        document.querySelector("#shape_and_name img").src =
    `/shapes_updated/${bestShape}/${bestShape}_white.png`;
}


window.addEventListener("DOMContentLoaded", () => {
    loadStats();
});