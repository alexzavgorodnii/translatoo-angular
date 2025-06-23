export type AuthProvider = {
  id: string;
  user_id: string;
  provider: 'local' | 'google' | 'github';
  provider_user_id: string | null;
  password_hash: string | null;
  created_at: string;
};
