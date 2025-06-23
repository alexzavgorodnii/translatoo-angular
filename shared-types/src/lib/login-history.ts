export type LoginHistory = {
  id: string;
  user_id: string | null;
  provider: 'local' | 'google' | 'github';
  ip_address: string;
  user_agent: string;
  successful: boolean;
  timestamp: string;
};
