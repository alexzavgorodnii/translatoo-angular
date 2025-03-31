import { Translation } from './translations';

export type Language = {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  format: string;
};

export type LanguageWithTranslations = Language & {
  translations: Translation[];
};
