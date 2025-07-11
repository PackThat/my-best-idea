import { createClient } from '@supabase/supabase-js'

// These lines read the secret keys from your new .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This check makes sure you haven't forgotten to create the .env file
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anonymous key is missing from .env file.");
}

// This creates the one-and-only Supabase client connection for our app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)