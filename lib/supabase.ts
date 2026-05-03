import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Helper to check if we have enough config
const hasAdminConfig = supabaseUrl && supabaseServiceKey;
const hasAnonConfig = supabaseUrl && supabaseAnonKey;

// Client for backend usage (with service role key)
export const supabaseAdmin = hasAdminConfig 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any;

// Client for frontend usage (with anon key)
export const supabase = hasAnonConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
