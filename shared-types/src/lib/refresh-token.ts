export type RefreshToken = {
  id: string;
  user_id: string;
  token: string; // hashed token
  expires_at: string;
  revoked: boolean;
  created_at: string;
};
