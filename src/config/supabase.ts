import { createClient } from '@supabase/supabase-js';

// Ensure these match exactly with your Supabase project settings
const supabaseUrl = 'https://pgekvtfpjokklqckyslk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZWt2dGZwam9ra2xxY2t5bHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NTQ4NTUsImV4cCI6MjA0ODEzMDg1NX0.E9X2wHv6zFVb4OtmbCuYASEszmCw53rLxF2Isa0zvtc';

const isDevelopment = process.env.NODE_ENV === 'development';

// Create Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'glossa_auth',
    storage: isDevelopment ? sessionStorage : localStorage,
  },
  global: {
    headers: { 
      'x-application-name': 'glossa',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection and log status
const testConnection = async () => {
  // Skip connection test in development mode
  if (isDevelopment) {
    console.log('[Supabase] Development mode - using mock data');
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('[Supabase] Active session found');
    }
    
    const start = Date.now();
    const { error } = await supabase
      .from('services')
      .select('count', { count: 'exact', head: true })
      .throwOnError();
    
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log(`[Supabase] Connection successful (${duration}ms)`);
  } catch (error) {
    console.error('[Supabase] Connection error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        console.warn('[Supabase] Network error - using offline mode');
      } else if (error.message.includes('not found')) {
        console.warn('[Supabase] Database error - check your table schema');
      }
    }
  }
};

// Initialize connection
testConnection();

// Database types
export type User = {
  id: string;
  email: string;
  church_name: string;
  created_at: string;
  is_admin: boolean;
};

export type Service = {
  id: string;
  title: string;
  date: string;
  time: string;
  is_live: boolean;
  created_by: string;
  created_at: string;
  languages: string[];
};

export type ServiceSession = {
  id: string;
  service_id: string;
  user_id: string | null;
  session_id: string;
  language: string;
  joined_at: string;
  last_seen_at: string;
};