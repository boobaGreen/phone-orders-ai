import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://qyoazexqodjxpmrhvqjv.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5b2F6ZXhxb2RqeHBtcmh2cWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzgzODQsImV4cCI6MjA1NzY1NDM4NH0.UeApjHjE9qZTipQlutexI9W9KWpHksA1fVUSHxpAxKw";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};
