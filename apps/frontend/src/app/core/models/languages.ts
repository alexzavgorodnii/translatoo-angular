import { Language, Translation } from 'shared-types';

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
