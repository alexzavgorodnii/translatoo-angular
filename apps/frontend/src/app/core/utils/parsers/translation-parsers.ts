import { TranslationFromFile } from '../../models/translations';

// Parse JSON files (standard, ARB)
export function parseJSON(content: string): TranslationFromFile[] {
  try {
    const data = JSON.parse(content);
    const translations: TranslationFromFile[] = [];

    // Handle _translatooMetadata if present
    const metadataKey = '_translatooMetadata';
    const cleanData = { ...data };
    if (cleanData[metadataKey]) {
      delete cleanData[metadataKey];
    }

    // Process the object structure with order tracking
    const order = 0;
    processJsonObject(cleanData, '', translations, order);

    return translations;
  } catch (e) {
    throw new Error(`Invalid JSON file: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Process JSON objects recursively with order tracking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processJsonObject(obj: any, contextPrefix: string, result: TranslationFromFile[], order: number): number {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // This is a nested object - treat as context
      order = processJsonObject(value, contextPrefix ? `${contextPrefix}.${key}` : key, result, order);
    } else {
      // This is a translation
      result.push({
        key,
        value: value as string,
        context: contextPrefix || undefined,
        order: order++,
        is_plural: false,
      });
    }
  }
  return order;
}

// Parse i18next JSON files
export function parseI18Next(content: string): TranslationFromFile[] {
  try {
    const data = JSON.parse(content);
    const translations: TranslationFromFile[] = [];
    let order = 0;

    // Process translation key
    if (data.translation) {
      order = processJsonObject(data.translation, '', translations, order);
    }

    // Process namespaced translations
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'translation' && typeof value === 'object' && value !== null) {
        if (typeof value === 'object' && value !== null && 'translation' in value) {
          order = processJsonObject(value.translation, key, translations, order);
        }
      }
    }

    return translations;
  } catch (e) {
    throw new Error(`Invalid i18next file: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Parse CSV files
export function parseCSV(content: string): TranslationFromFile[] {
  const lines = content.split(/\r?\n/);
  const translations: TranslationFromFile[] = [];

  // Skip comment lines and empty lines
  const dataLines = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('#'));

  if (dataLines.length === 0) {
    return translations;
  }

  // Determine if file has header row
  const firstLine = dataLines[0];
  const hasHeader = /context|key|value|order/i.test(firstLine);

  // Parse header to find column indices
  const headerRow = hasHeader ? parseCSVRow(firstLine) : ['context', 'key', 'value'];
  const contextIndex = headerRow.findIndex(col => col.toLowerCase() === 'context');
  const keyIndex = headerRow.findIndex(col => col.toLowerCase() === 'key');
  const valueIndex = headerRow.findIndex(col => col.toLowerCase() === 'value');
  const orderIndex = headerRow.findIndex(col => col.toLowerCase() === 'order');

  if (keyIndex === -1 || valueIndex === -1) {
    throw new Error('CSV file must contain at least "key" and "value" columns');
  }

  // Parse data rows
  const startIndex = hasHeader ? 1 : 0;
  for (let i = startIndex; i < dataLines.length; i++) {
    const row = parseCSVRow(dataLines[i]);

    if (row.length > Math.max(contextIndex, keyIndex, valueIndex)) {
      const key = row[keyIndex];
      const value = row[valueIndex];
      const context = contextIndex >= 0 ? row[contextIndex] : undefined;
      // Use explicit order from file if available, otherwise use row index
      const order = orderIndex >= 0 && !isNaN(Number(row[orderIndex])) ? Number(row[orderIndex]) : i - startIndex;

      translations.push({
        key,
        value,
        context: context && context.trim() !== '' ? context : undefined,
        order,
        is_plural: false,
      });
    }
  }

  return translations;
}

// Helper for CSV row parsing
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quote inside quoted field
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);
  return result;
}

// Parse XML files (including Android resources)
export function parseXML(content: string): TranslationFromFile[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, 'text/xml');

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML file');
  }

  const translations: TranslationFromFile[] = [];
  let order = 0;

  // Helper function to extract comments preceding an element
  function getElementComment(element: Element): string | undefined {
    let node = element.previousSibling;
    while (node) {
      // Skip whitespace nodes
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '') {
        node = node.previousSibling;
        continue;
      }

      // If we find a comment node, return its content
      if (node.nodeType === Node.COMMENT_NODE) {
        return node.textContent?.trim();
      }

      // If we find any other non-whitespace node, stop looking
      break;
    }
    return undefined;
  }

  // Handle Android string resources
  const resources = xmlDoc.querySelector('resources');
  if (resources) {
    // Process context groups
    const contexts = resources.querySelectorAll('context');
    if (contexts.length > 0) {
      // Process grouped strings
      contexts.forEach(context => {
        const contextName = context.getAttribute('name') || '';

        // Process normal strings in this context
        const strings = context.querySelectorAll('string');
        strings.forEach(stringEl => {
          const key = stringEl.getAttribute('name') || '';
          const value = stringEl.textContent || '';
          const comment = getElementComment(stringEl);

          if (key) {
            translations.push({
              key,
              value,
              context: contextName,
              order: order++,
              is_plural: false,
              comment,
            });
          }
        });

        // Process plurals in this context
        const plurals = context.querySelectorAll('plurals');
        plurals.forEach(pluralEl => {
          const pluralKey = pluralEl.getAttribute('name') || '';
          if (!pluralKey) return;

          const comment = getElementComment(pluralEl);

          const items = pluralEl.querySelectorAll('item');
          items.forEach(item => {
            const quantity = item.getAttribute('quantity');
            if (!quantity) return;

            translations.push({
              key: pluralKey,
              value: item.textContent || '',
              context: contextName,
              order: order++,
              is_plural: true,
              plural_key: quantity,
              comment,
            });
          });
        });
      });
    } else {
      // Process flat structure - first normal strings
      const strings = resources.querySelectorAll('string');
      strings.forEach(stringEl => {
        let key = stringEl.getAttribute('name') || '';
        let context: string | null = null;
        if (key.split('.').length > 1) {
          context = key.split('.').slice(0, -1).join('.');
          key = key.split('.').pop() || '';
        }
        const value = stringEl.textContent?.replace(/^"|"$/g, '') || '';
        const comment = getElementComment(stringEl);

        if (key) {
          translations.push({
            key,
            value,
            context: context || undefined,
            order: order++,
            is_plural: false,
            comment,
          });
        }
      });

      // Then process plurals at the root level
      const plurals = resources.querySelectorAll('plurals');
      plurals.forEach(pluralEl => {
        const pluralKey = pluralEl.getAttribute('name') || '';
        if (!pluralKey) return;

        const comment = getElementComment(pluralEl);

        // Check if pluralKey contains dot notation for context
        let context: string | undefined;
        let finalKey = pluralKey;
        if (pluralKey.includes('.')) {
          const parts = pluralKey.split('.');
          context = parts.slice(0, -1).join('.');
          finalKey = parts[parts.length - 1];
        }

        const items = pluralEl.querySelectorAll('item');
        items.forEach(item => {
          const quantity = item.getAttribute('quantity');
          if (!quantity) return;

          translations.push({
            key: finalKey,
            value: item.textContent || '',
            context,
            order: order++,
            is_plural: true,
            plural_key: quantity,
            comment,
          });
        });
      });
    }
  }

  return translations;
}

// Parse XLIFF files
export function parseXLIFF(content: string): TranslationFromFile[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, 'text/xml');

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XLIFF file');
  }

  const translations: TranslationFromFile[] = [];
  let order = 0;

  // Get all translation units
  const transUnits = xmlDoc.querySelectorAll('trans-unit');

  transUnits.forEach(unit => {
    const id = unit.getAttribute('id') || '';

    // Try to find source and target elements
    const source = unit.querySelector('source');
    const target = unit.querySelector('target');

    // Get context information if available
    let context = '';
    const contextGroup = unit.querySelector('context-group');
    if (contextGroup) {
      const contextEl = contextGroup.querySelector('context[context-type="sourcefile"]');
      if (contextEl) {
        context = contextEl.textContent || '';
      }
    }

    if (source) {
      const key = id;
      const value = target ? target.textContent || '' : source.textContent || '';

      translations.push({
        key,
        value,
        context: context || undefined,
        order: order++,
        is_plural: false,
      });
    }
  });

  return translations;
}

// Parse iOS Strings files
export function parseIOSStrings(content: string): TranslationFromFile[] {
  const translations: TranslationFromFile[] = [];
  const lines = content.split(/\r?\n/);
  let order = 0;
  let currentContext = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === '') continue;

    // Check for context comments
    if (line.startsWith('/*') && line.endsWith('*/')) {
      currentContext = line.substring(2, line.length - 2).trim();
      continue;
    }

    // Parse key-value pairs
    const match = line.match(/"(.+?)"\s*=\s*"(.+?)"\s*;/);
    if (match) {
      const key = match[1].replace(/\\"/g, '"');
      const value = match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');

      translations.push({
        key,
        value,
        context: currentContext || undefined,
        order: order++,
        is_plural: false,
      });
    }
  }

  return translations;
}

// Parse iOS XCStrings files
export function parseXCStrings(content: string): TranslationFromFile[] {
  try {
    const data = JSON.parse(content);
    const translations: TranslationFromFile[] = [];
    let order = 0;

    if (!data.strings) {
      throw new Error('Invalid XCStrings format: missing strings object');
    }

    for (const [key, info] of Object.entries(data.strings)) {
      // Get the target language
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localizations = (info as any).localizations;
      if (!localizations) continue;

      // Get the comment as context if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = (info as any).comment;

      // Extract first available localization
      const firstLocale = Object.keys(localizations)[0];
      if (!firstLocale) continue;

      const localization = localizations[firstLocale];
      if (!localization) continue;

      const value = localization.stringUnit?.value || '';

      translations.push({
        key,
        value,
        context,
        order: order++,
        is_plural: false,
      });
    }

    return translations;
  } catch (e) {
    throw new Error(`Invalid XCStrings file: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Parse Gettext PO files
export function parsePO(content: string): TranslationFromFile[] {
  const translations: TranslationFromFile[] = [];
  const lines = content.split(/\r?\n/);
  let order = 0;

  let currentMsgid = '';
  let currentMsgstr = '';
  let currentContext = '';
  let collectingMsgid = false;
  let collectingMsgstr = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === '') {
      // End of a translation entry
      if (currentMsgid && currentMsgstr) {
        translations.push({
          key: currentMsgid,
          value: currentMsgstr,
          context: currentContext || undefined,
          order: order++,
          is_plural: false,
        });

        currentMsgid = '';
        currentMsgstr = '';
        currentContext = '';
      }
      continue;
    }

    // Check for comments with context
    if (line.startsWith('#:')) {
      currentContext = line.substring(2).trim();
      continue;
    }

    // Start of msgid
    if (line.startsWith('msgid ')) {
      currentMsgid = extractPOString(line.substring(6));
      collectingMsgid = currentMsgid === '';
      collectingMsgstr = false;
      continue;
    }

    // Start of msgstr
    if (line.startsWith('msgstr ')) {
      currentMsgstr = extractPOString(line.substring(7));
      collectingMsgid = false;
      collectingMsgstr = currentMsgstr === '';
      continue;
    }

    // Multiline strings - continuation lines
    if (line.startsWith('"') && line.endsWith('"')) {
      const content = extractPOString(line);

      if (collectingMsgid) {
        currentMsgid += content;
      } else if (collectingMsgstr) {
        currentMsgstr += content;
      }
    }
  }

  // Don't forget the last entry
  if (currentMsgid && currentMsgstr) {
    translations.push({
      key: currentMsgid,
      value: currentMsgstr,
      context: currentContext || undefined,
      order: order++,
      is_plural: false,
    });
  }

  return translations;
}

// Helper for extracting PO strings
function extractPOString(line: string): string {
  if (!line.startsWith('"') || !line.endsWith('"')) {
    return line;
  }

  const content = line.substring(1, line.length - 1);
  return content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}
