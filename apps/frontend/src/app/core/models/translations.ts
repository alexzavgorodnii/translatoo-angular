export type TranslationFromFile = {
  id?: number;
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
  id: number;
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
