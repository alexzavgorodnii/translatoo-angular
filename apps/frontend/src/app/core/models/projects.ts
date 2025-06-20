import { Project } from 'shared-types';
import { LanguageWithTranslations } from './languages';

export type ProjectWithLanguages = Project & {
  languages: LanguageWithTranslations[];
};
