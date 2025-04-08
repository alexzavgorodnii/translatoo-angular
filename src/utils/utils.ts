import { TranslationFromFile } from '../models/translations';
import { parseJSON, parseI18Next, parseCSV, parseXML } from './parsers/translation-parsers';
import { ComparisonResult, TranslationGroup, UpdatedTranslationGroup, MissingTranslationGroup } from './types';

// Helper function to compare translations
export const compareTranslations = (
  importedTranslations: TranslationFromFile[],
  existingTranslations: TranslationFromFile[],
): ComparisonResult => {
  // Create a composite key that includes plurals for comparison
  const getComparisonKey = (t: TranslationFromFile) => `${t.key}__${t.plural_key || ''}__${t.context || ''}`;

  const existingKeys = new Set(existingTranslations.map(getComparisonKey));
  const importedKeys = new Set(importedTranslations.map(getComparisonKey));

  // Find new translations (in import but not in existing)
  const newTranslations = importedTranslations.filter(t => !existingKeys.has(getComparisonKey(t)));

  // Find updated translations (in both but with different values)
  const updatedTranslations = importedTranslations
    .filter(t => {
      const compKey = getComparisonKey(t);
      const existingTranslation = existingTranslations.find(et => getComparisonKey(et) === compKey);
      return existingTranslation && existingTranslation.value !== t.value;
    })
    .map(t => {
      const compKey = getComparisonKey(t);
      const existingTranslation = existingTranslations.find(et => getComparisonKey(et) === compKey)!;

      return {
        key: t.key,
        oldValue: existingTranslation.value,
        newValue: t.value,
        context: t.context || existingTranslation.context,
        order: t.order || existingTranslation.order,
        selected: true, // Default to selected
        is_plural: t.is_plural,
        plural_key: t.plural_key,
        comment: t.comment, // Include comment from imported translation
      };
    });

  // Find missing translations (in existing but not in import)
  const missingTranslations = existingTranslations
    .filter(t => !importedKeys.has(getComparisonKey(t)))
    .map(t => ({
      ...t,
      selected: false, // Default to not selected (don't delete by default)
    }));

  return {
    newTranslations,
    updatedTranslations,
    missingTranslations,
  };
};

// Helper functions for grouping translations
export const groupTranslationsByKeyAndContext = (translations: TranslationFromFile[]): TranslationGroup[] => {
  // Create a composite key for grouping
  const getGroupKey = (t: TranslationFromFile) => `${t.key}__${t.context || ''}`;

  // Group translations
  const groups: Record<string, TranslationGroup> = {};

  translations.forEach(translation => {
    const groupKey = getGroupKey(translation);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: translation.key,
        context: translation.context,
        translations: [],
        hasPlurals: false,
      };
    }

    groups[groupKey].translations.push(translation);

    // Check if this group has plurals
    if (translation.is_plural) {
      groups[groupKey].hasPlurals = true;
    }
  });

  return Object.values(groups);
};

export const groupUpdatedTranslationsByKeyAndContext = (
  translations: ComparisonResult['updatedTranslations'],
): UpdatedTranslationGroup[] => {
  // Create a composite key for grouping
  const getGroupKey = (t: (typeof translations)[0]) => `${t.key}__${t.context || ''}`;

  // Group translations
  const groups: Record<string, UpdatedTranslationGroup> = {};

  // Assign original indices for tracking
  const translationsWithIndices = translations.map((t, idx) => ({
    ...t,
    originalIndex: idx,
  }));

  translationsWithIndices.forEach(translation => {
    const groupKey = getGroupKey(translation);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: translation.key,
        context: translation.context,
        translations: [],
        hasPlurals: false,
        allSelected: true,
      };
    }

    groups[groupKey].translations.push(translation);

    // Check if this group has plurals
    if (translation.is_plural) {
      groups[groupKey].hasPlurals = true;
    }

    // Update selection state
    if (!translation.selected) {
      groups[groupKey].allSelected = false;
    }
  });

  return Object.values(groups);
};

export const groupMissingTranslationsByKeyAndContext = (
  translations: ComparisonResult['missingTranslations'],
): MissingTranslationGroup[] => {
  // Create a composite key for grouping
  const getGroupKey = (t: (typeof translations)[0]) => `${t.key}__${t.context || ''}`;

  // Group translations
  const groups: Record<string, MissingTranslationGroup> = {};

  // Assign original indices for tracking
  const translationsWithIndices = translations.map((t, idx) => ({
    ...t,
    originalIndex: idx,
  }));

  translationsWithIndices.forEach(translation => {
    const groupKey = getGroupKey(translation);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: translation.key,
        context: translation.context,
        translations: [],
        hasPlurals: false,
        allSelected: true,
      };
    }

    groups[groupKey].translations.push(translation);

    // Check if this group has plurals
    if (translation.is_plural) {
      groups[groupKey].hasPlurals = true;
    }

    // Update selection state
    if (!translation.selected) {
      groups[groupKey].allSelected = false;
    }
  });

  return Object.values(groups);
};

// Parse file content based on format
export const parseFileContent = (content: string, format: string): TranslationFromFile[] => {
  switch (format) {
    case 'keyvalue-json':
      return parseJSON(content);
    case 'i18next-json':
      return parseI18Next(content);
    case 'json':
    case 'json-1':
    case 'arb':
      return parseJSON(content);
    case 'csv':
      return parseCSV(content);
    case 'xml':
      return parseXML(content);
    // Add other formats as you implement them
    default:
      throw new Error(`Import for format '${format}' is not yet implemented`);
  }
};

// Helper to detect format from file extension
export const detectFormatFromExtension = (extension: string): string | undefined => {
  const extensionFormatMap: Record<string, string> = {
    json: 'keyvalue-json',
    arb: 'arb',
    csv: 'csv',
    ini: 'ini',
    properties: 'properties',
    xml: 'xml',
    yml: 'yml',
    yaml: 'yml',
    php: 'php',
    po: 'po',
    strings: 'strings',
    xcstrings: 'xcstrings',
    xliff: 'xliff',
    xlf: 'xliff',
    xmb: 'xmb',
    xtb: 'xtb',
  };

  return extensionFormatMap[extension];
};

// Read file content as text
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
};
