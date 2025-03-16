import { createClient } from "@supabase/supabase-js";

// Ottieni le variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

// Configurazione URL di callback
const AUTH_CALLBACK_URL =
  import.meta.env.VITE_AUTH_CALLBACK_URL ||
  `${window.location.origin}/auth/callback`;

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Login con Google
export const signInWithGoogle = async () => {
  console.log("Redirecting OAuth to:", AUTH_CALLBACK_URL);

  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: AUTH_CALLBACK_URL,
    },
  });
};

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const getSupabaseToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};
