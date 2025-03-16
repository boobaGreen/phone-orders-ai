import { createClient } from "@supabase/supabase-js";

// Ottieni le variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

// Configurazione URL di callback
// const AUTH_CALLBACK_URL = `${window.location.origin}/auth/callback`;

// Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Login con Google
export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}/auth/callback`; // Deve corrispondere alla route nel router
  console.log("OAuth flow starting. App callback will be:", redirectUrl);

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("OAuth initialization error:", error);
      throw error;
    }

    return { data, error: null };
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

export const getSupabaseToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error("Error getting Supabase token:", error);
    return null;
  }
};

/**
 * Invia un'email per il reset della password
 * @param email Email dell'utente
 * @returns Promise con il risultato dell'operazione
 */
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

/**
 * Aggiorna la password dopo il reset
 * @param newPassword La nuova password
 * @returns Promise con il risultato dell'operazione
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};
