import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../config';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const verifySupabaseToken = async (token: string) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error(error?.message || 'Invalid Supabase token');
  }
  return data.user;
};

export const signUpUser = async (payload: { email: string; password: string; role: string; name: string; studentId?: string | null; }) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    user_metadata: {
      role: payload.role,
      full_name: payload.name,
      student_id: payload.studentId
    },
    email_confirm: true
  });

  if (error) throw new Error(error.message);
  const user = data.user as User;
  await supabase.from('profiles').insert([{ id: user.id, email: payload.email, role: payload.role, full_name: payload.name, student_id: payload.studentId, created_at: new Date().toISOString() }]);
  return user;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error || !data.session) throw new Error(error?.message || 'Unable to sign in');
  return data;
};

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return data;
};

export const supabaseAdminClient = supabase;
