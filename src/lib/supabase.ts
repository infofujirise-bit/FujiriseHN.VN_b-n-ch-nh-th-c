/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy initialization to prevent app crash when keys are missing
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const warn = () => console.warn('SUPABASE ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.');
    
    return {
      from: () => ({
        insert: () => { warn(); return { error: { message: 'Supabase not configured' } }; },
        select: (columns?: string, options?: any) => { 
          warn(); 
          return { 
            data: [], 
            count: 0, 
            error: { message: 'Supabase not configured' },
            order: function() { return this; },
            limit: function() { return this; },
            single: () => ({ data: null, error: { message: 'Supabase not configured' } }),
            eq: function() { return this; }
          }; 
        },
        order: function() { return this; },
        limit: function() { return this; },
        single: () => { warn(); return { data: null, error: { message: 'Supabase not configured' } }; },
        eq: function() { return this; },
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async () => { warn(); return { data: {}, error: null }; },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => { warn(); },
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => { warn(); return { data: { user: null, session: null }, error: null }; },
      },
      channel: () => ({
        on: function() { return this; },
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      removeChannel: () => {},
    };
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient() as any;

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface Product {
  id: number;
  title: string;
  category?: string;
  description?: string;
  images?: any;
  specs?: any;
  material?: string;
  longDescription?: string;
  created_at?: string;
  model?: string;
  technology?: string;
  cabin?: any;
}

export interface PageView {
  id?: number;
  path: string;
  created_at?: string;
}

export interface WarrantyPolicy {
  id?: string;
  content: string;
  updated_at?: string;
}

export interface SiteSettings {
  id?: string;
  font_family?: string;
  accent_color?: string;
  updated_at?: string;
}
