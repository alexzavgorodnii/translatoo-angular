import { Translation } from './translations';

export type Language = {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  format: string;
  app_type: string;
};

export type LanguageWithTranslations = Language & {
  translations: Translation[];
  progress?: number;
};

export const appTypes = [
  { name: 'Web', value: 'web' },
  { name: 'iOS', value: 'ios' },
  { name: 'Android', value: 'android' },
  { name: 'Desktop', value: 'desktop' },
  { name: 'Other', value: 'other' },
];
