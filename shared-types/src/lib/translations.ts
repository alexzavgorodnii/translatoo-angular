export type Translation = {
  id?: number;
  created_at: string;
  key: string;
  value: string;
  comment?: string;
  tag?: string;
  language_id: string;
  context?: string;
  order: number;
  is_plural: boolean;
  plural_key?: string;
  temp_value?: string;
};
