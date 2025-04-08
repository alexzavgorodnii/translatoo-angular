import { LanguageWithTranslations } from '../models/languages';
import { TranslationFromFile } from '../models/translations';

export interface ImportClientWrapperProps {
  initialLanguage: LanguageWithTranslations;
}

// Define types for the different translation categories
export interface ComparisonResult {
  newTranslations: TranslationFromFile[];
  updatedTranslations: {
    key: string;
    oldValue: string;
    newValue: string;
    context?: string;
    order: number;
    selected: boolean;
    is_plural: boolean;
    plural_key?: string;
    comment?: string;
  }[];
  missingTranslations: {
    key: string;
    value: string;
    context?: string;
    order: number;
    selected: boolean;
    is_plural: boolean;
    plural_key?: string;
    comment?: string;
  }[];
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
