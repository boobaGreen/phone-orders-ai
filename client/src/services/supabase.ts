import { createClient } from "@supabase/supabase-js";

// Ottieni le variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

// Configurazione URL di callback
const AUTH_CALLBACK_URL = `${window.location.origin}/auth/callback`;

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Login con Google
export const signInWithGoogle = async () => {
  console.log("OAuth flow starting. App callback will be:", AUTH_CALLBACK_URL);

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: AUTH_CALLBACK_URL,
        // Non impostare altri parametri qui, lascia che Supabase gestisca il flusso
      },
    });

    if (error) {
      console.error("OAuth initialization error:", error);
    }

    return { data, error };
  } catch (e) {
    console.error("Unexpected error during OAuth:", e);
    throw e;
  }
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
