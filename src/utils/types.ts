import { LanguageWithTranslations } from '../models/languages';
import { MissingTranslationFromFile, TranslationFromFile, UpdatedTranslationFromFile } from '../models/translations';

export interface ImportClientWrapperProps {
  initialLanguage: LanguageWithTranslations;
}

// Define types for the different translation categories
export interface ComparisonResult {
  newTranslations: TranslationFromFile[];
  updatedTranslations: UpdatedTranslationFromFile[];
  missingTranslations: MissingTranslationFromFile[];
}

// Types for grouped translations
export interface TranslationGroup {
  key: string;
  context?: string;
  translations: TranslationFromFile[];
  hasPlurals: boolean;
}

export interface UpdatedTranslationGroup {
  key: string;
  context?: string;
  translations: (ComparisonResult['updatedTranslations'][0] & { originalIndex: number })[];
  hasPlurals: boolean;
  allSelected: boolean;
}

export interface MissingTranslationGroup {
  key: string;
  context?: string;
  translations: (ComparisonResult['missingTranslations'][0] & { originalIndex: number })[];
  hasPlurals: boolean;
  allSelected: boolean;
}
