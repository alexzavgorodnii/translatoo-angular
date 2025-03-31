export type TranslationFromFile = {
  key: string;
  value: string;
  context?: string;
  comment?: string;
  tag?: string;
  order: number;
  is_plural: boolean;
  plural_key?: string;
};

export type Translation = TranslationFromFile & {
  id?: number;
  context?: string;
  created_at: string;
};
