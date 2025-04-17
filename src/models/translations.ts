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

export type UpdatedTranslationFromFile = {
  key: string;
  oldValue: string;
  newValue: string;
  context?: string;
  order: number;
  selected: boolean;
  is_plural: boolean;
  plural_key?: string;
  comment?: string;
};

export type MissingTranslationFromFile = {
  key: string;
  value: string;
  context?: string;
  order: number;
  selected: boolean;
  is_plural: boolean;
  plural_key?: string;
  comment?: string;
};

export type Translation = TranslationFromFile & {
  id?: number;
  context?: string;
  temp_value?: string;
  language_id: string;
  created_at: string;
};
