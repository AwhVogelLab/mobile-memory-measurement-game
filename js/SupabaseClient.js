// Supabase project connection info
const SUPABASE_URL = "https://achmfqygpccbimcntyzv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaG1mcXlncGNjYmltY250eXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNDE4NDAsImV4cCI6MjA5NzkxNzg0MH0.ZbT8XfYEhQ3ZHY3QZbLY05sLxLFpGfDkD2NjZIeSIEY";

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);