import { Translation } from 'shared-types';
import { LanguageWithTranslations } from '../../models/languages';

// XLIFF format (version 1.2)
export const generateXLIFF = (translations: Translation[], language: LanguageWithTranslations): string => {
  const sourceLang = 'en'; // You might want to make this configurable
  const targetLang = language.name || 'en';

  let xliff = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xliff += '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">\n';
  // eslint-disable-next-line max-len
  xliff += `  <file source-language="${sourceLang}" target-language="${targetLang}" datatype="plaintext" original="ng2.template">\n`;
  xliff += '    <body>\n';

  // Group translations by context
  const translationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!translationsByContext[context]) {
      translationsByContext[context] = [];
    }
    translationsByContext[context].push(translation);
  }

  // Process translations
  for (const [context, contextTranslations] of Object.entries(translationsByContext)) {
    for (const translation of contextTranslations) {
      const safeKey = translation.key.replace(/[^\w.-]/g, '_');
      const escapedValue =
        typeof translation.value === 'string'
          ? translation.value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/'/g, '&apos;')
              .replace(/"/g, '&quot;')
          : translation.value;

      xliff += `      <trans-unit id="${safeKey}" datatype="html">\n`;
      xliff += `        <source>${escapedValue}</source>\n`;
      xliff += `        <target>${escapedValue}</target>\n`;

      // Add context information if available
      if (context) {
        xliff += '        <context-group purpose="location">\n';
        xliff += `          <context context-type="sourcefile">${context}</context>\n`;
        xliff += '          <context context-type="linenumber">1</context>\n';
        xliff += '        </context-group>\n';
      }

      xliff += '      </trans-unit>\n';
    }
  }

  xliff += '    </body>\n';
  xliff += '  </file>\n';
  xliff += '</xliff>';

  return xliff;
};

// iOS Strings format
export const generateIOSStrings = (translations: Translation[]): string => {
  let result = '/* Generated by Translatoo */\n\n';

  // Group translations by context
  const translationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!translationsByContext[context]) {
      translationsByContext[context] = [];
    }
    translationsByContext[context].push(translation);
  }

  // Process translations
  for (const [context, contextTranslations] of Object.entries(translationsByContext)) {
    if (context) {
      result += `/* ${context} */\n`;
    }

    for (const translation of contextTranslations) {
      const escapedKey = translation.key.replace(/"/g, '\\"');
      const escapedValue =
        typeof translation.value === 'string'
          ? translation.value.replace(/"/g, '\\"').replace(/\n/g, '\\n')
          : translation.value;

      result += `"${escapedKey}" = "${escapedValue}";\n`;
    }

    result += '\n';
  }

  return result;
};

// iOS XCStrings format (JSON-based)
export const generateXCStrings = (translations: Translation[], language: LanguageWithTranslations): string => {
  const sourceLang = 'en'; // Typically the source language
  const targetLang = language.name || 'en';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {
    sourceLanguage: sourceLang,
    strings: {},
    version: '1.0',
  };

  for (const translation of translations) {
    result.strings[translation.key] = {
      localizations: {
        [targetLang]: {
          stringUnit: {
            state: 'translated',
            value: translation.value,
          },
        },
      },
    };

    // Add context as comment if available
    if (translation.context) {
      result.strings[translation.key].comment = translation.context;
    }
  }

  return JSON.stringify(result, null, 2);
};

// Gettext PO format
export const generatePO = (translations: Translation[], language: LanguageWithTranslations): string => {
  // eslint-disable-next-line max-len
  const header = `msgid ""\nmsgstr ""\n"MIME-Version: 1.0\\n"\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Content-Transfer-Encoding: 8bit\\n"\n"X-Generator: Translatoo\\n"\n"Project-Id-Version: ${language.name || 'Translatoo Export'}\\n"\n"Language: ${language.name || 'en'}\\n"\n"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n\n`;

  let result = header;

  // Group translations by context
  const translationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!translationsByContext[context]) {
      translationsByContext[context] = [];
    }
    translationsByContext[context].push(translation);
  }

  // Process translations
  for (const [context, contextTranslations] of Object.entries(translationsByContext)) {
    for (const translation of contextTranslations) {
      // Add context comment if available
      if (context) {
        result += `#: ${context}\n`;
      }

      // Handle multiline strings properly
      const msgid = formatPOString(translation.key);
      const msgstr = formatPOString(translation.value);

      result += `msgid ${msgid}\n`;
      result += `msgstr ${msgstr}\n\n`;
    }
  }

  return result;
};

// Helper for PO string formatting
export const formatPOString = (text: string): string => {
  if (!text || typeof text !== 'string') return '""';

  if (text.includes('\n')) {
    // Multiline format
    const lines = text.split('\n');
    return `""\n${lines.map(line => `"${escapePoString(line)}\\n"`).join('\n')}`;
  } else {
    // Simple string
    return `"${escapePoString(text)}"`;
  }
};

// Helper for escaping PO strings
export const escapePoString = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

// Angular XMB format
export const generateXMB = (translations: Translation[]): string => {
  let result = '<?xml version="1.0" encoding="UTF-8" ?>\n';
  result += '<!DOCTYPE messagebundle [\n';
  result += '  <!ELEMENT messagebundle (msg)*>\n';
  result += '  <!ATTLIST messagebundle class CDATA #IMPLIED>\n\n';
  result += '  <!ELEMENT msg (#PCDATA|ph|source)*>\n';
  result += '  <!ATTLIST msg id CDATA #IMPLIED>\n';
  result += '  <!ATTLIST msg desc CDATA #IMPLIED>\n';
  result += '  <!ATTLIST msg meaning CDATA #IMPLIED>\n';
  result += '  <!ATTLIST msg xml:space (default|preserve) "default">\n\n';
  result += '  <!ELEMENT source (#PCDATA)>\n\n';
  result += '  <!ELEMENT ph (#PCDATA|ex)*>\n';
  result += '  <!ATTLIST ph name CDATA #REQUIRED>\n\n';
  result += '  <!ELEMENT ex (#PCDATA)>\n';
  result += ']>\n';
  result += '<messagebundle>\n';

  for (const translation of translations) {
    const escapedValue =
      typeof translation.value === 'string'
        ? translation.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
        : translation.value;

    // Use the key hash as ID (simplified for example)
    const id = hashString(translation.key);

    result += `  <msg id="${id}"`;

    if (translation.context) {
      result += ` desc="${escapeXmlAttr(translation.context)}"`;
    }

    result += `>${escapedValue}</msg>\n`;
  }

  result += '</messagebundle>';

  return result;
};

// Angular XTB format
export const generateXTB = (translations: Translation[], language: LanguageWithTranslations): string => {
  let result = '<?xml version="1.0" encoding="UTF-8"?>\n';
  result += '<!DOCTYPE translationbundle [\n';
  result += '  <!ELEMENT translationbundle (translation)*>\n';
  result += '  <!ATTLIST translationbundle lang CDATA #REQUIRED>\n\n';
  result += '  <!ELEMENT translation (#PCDATA|ph)*>\n';
  result += '  <!ATTLIST translation id CDATA #REQUIRED>\n';
  result += '  <!ATTLIST translation desc CDATA #IMPLIED>\n';
  result += '  <!ATTLIST translation meaning CDATA #IMPLIED>\n';
  result += '  <!ATTLIST translation xml:space (default|preserve) "default">\n\n';
  result += '  <!ELEMENT ph (#PCDATA|ex)*>\n';
  result += '  <!ATTLIST ph name CDATA #REQUIRED>\n\n';
  result += '  <!ELEMENT ex (#PCDATA)>\n';
  result += ']>\n';
  result += `<translationbundle lang="${language.name || 'en'}">\n`;

  for (const translation of translations) {
    const escapedValue =
      typeof translation.value === 'string'
        ? translation.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
        : translation.value;

    // Use the key hash as ID (simplified for example)
    const id = hashString(translation.key);

    result += `  <translation id="${id}"`;

    if (translation.context) {
      result += ` desc="${escapeXmlAttr(translation.context)}"`;
    }

    result += `>${escapedValue}</translation>\n`;
  }

  result += '</translationbundle>';

  return result;
};

// Simple hash function for generating IDs
export const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to hex string and ensure it's positive
  return Math.abs(hash).toString(16);
};

// Helper for escaping XML attributes
export const escapeXmlAttr = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const generateKeyValueJSON = (translations: Translation[]): string => {
  // First sort translations by order property if it exists
  const sortedTranslations = [...translations].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = {};

  sortedTranslations.forEach(translation => {
    if (!translation.context || translation.context.trim() === '') {
      // No context, add directly to root
      json[translation.key] = translation.value;
      return;
    }

    // Handle nested contexts (split by dots)
    const contextParts = translation.context.split('.');
    let current = json;

    // Navigate through the context parts and create nested objects as needed
    for (let i = 0; i < contextParts.length; i++) {
      const part = contextParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    // Add the actual translation at the deepest level
    current[translation.key] = translation.value;
  });

  return JSON.stringify(json, null, 2);
};

export const generateI18Next = (translations: Translation[]): string => {
  // Similar approach for i18next
  const i18nByContext: Record<string, Record<string, unknown>> = {};
  const i18nNoContext: Record<string, unknown> = {};

  translations.forEach(translation => {
    if (translation.context && translation.context.trim() !== '') {
      if (!i18nByContext[translation.context]) {
        i18nByContext[translation.context] = {};
      }
      i18nByContext[translation.context][translation.key] = translation.value;
    } else {
      i18nNoContext[translation.key] = translation.value;
    }
  });

  return JSON.stringify(
    {
      translation: i18nNoContext,
      ...Object.entries(i18nByContext).reduce(
        (acc, [context, values]) => {
          acc[context] = { translation: values };
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    },
    null,
    2,
  );
};

export const generateCsv = (translations: Translation[]): string => {
  // CSV has no standard comment format, but we can add a header row
  let csv = '';
  csv += 'context,key,value\n';

  for (const translation of translations) {
    const context = translation.context || '';
    const escapedKey = `"${translation.key.replace(/"/g, '""')}"`;
    const escapedValue =
      typeof translation.value === 'string' ? `"${translation.value.replace(/"/g, '""')}"` : translation.value;
    const escapedContext = `"${context.replace(/"/g, '""')}"`;

    csv += `${escapedContext},${escapedKey},${escapedValue}\n`;
  }

  return csv;
};

export const generateXml = (translations: Translation[]): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<resources>\n';

  // Rest of the XML generation code...
  const translationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!translationsByContext[context]) {
      translationsByContext[context] = [];
    }
    translationsByContext[context].push(translation);
  }

  for (const [context, contextTranslations] of Object.entries(translationsByContext)) {
    if (context) {
      xml += `  <context name="${context}">\n`;
    }

    for (const translation of contextTranslations) {
      const escapedValue =
        typeof translation.value === 'string'
          ? translation.value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;')
          : translation.value;

      xml += `  ${context ? '  ' : ''}<string name="${translation.key}">${escapedValue}</string>\n`;
    }

    if (context) {
      xml += `  </context>\n`;
    }
  }

  xml += '</resources>';
  return xml;
};

export const generateYml = (translations: Translation[]): string => {
  // YAML supports # comments
  let yaml = '';

  // Group translations by context
  const yamlTranslationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!yamlTranslationsByContext[context]) {
      yamlTranslationsByContext[context] = [];
    }
    yamlTranslationsByContext[context].push(translation);
  }

  for (const [context, contextTranslations] of Object.entries(yamlTranslationsByContext)) {
    if (context) {
      yaml += `${context}:\n`;
      yaml += `  # ${contextTranslations.length} entries in this context\n`;

      for (const translation of contextTranslations) {
        const needsQuotes =
          typeof translation.value === 'string' &&
          (/[:{}[\],&*#?|\-<>=!%@`]/g.test(translation.value) || translation.value.trim() !== translation.value);

        const formattedValue = needsQuotes ? `"${translation.value.replace(/"/g, '\\"')}"` : translation.value;
        yaml += `  ${translation.key}: ${formattedValue}\n`;
      }

      yaml += '\n';
    } else {
      yaml += '# Root level translations (no context)\n';
      for (const translation of contextTranslations) {
        const needsQuotes =
          typeof translation.value === 'string' &&
          (/[:{}[\],&*#?|\-<>=!%@`]/g.test(translation.value) || translation.value.trim() !== translation.value);

        const formattedValue = needsQuotes ? `"${translation.value.replace(/"/g, '\\"')}"` : translation.value;
        yaml += `${translation.key}: ${formattedValue}\n`;
      }
      yaml += '\n';
    }
  }

  return yaml;
};

export const generateIni = (translations: Translation[]): string => {
  // INI supports ; or # comments
  let ini = '';

  // Group by context to create sections
  const iniTranslationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!iniTranslationsByContext[context]) {
      iniTranslationsByContext[context] = [];
    }
    iniTranslationsByContext[context].push(translation);
  }

  // Write sections
  for (const [context, contextTranslations] of Object.entries(iniTranslationsByContext)) {
    if (context) {
      ini += `[${context}]\n`;
    } else {
      ini += '; Global translations\n';
    }

    for (const translation of contextTranslations) {
      ini += `${translation.key}=${translation.value}\n`;
    }

    ini += '\n';
  }

  return ini;
};

export const generateProperties = (translations: Translation[]): string => {
  // Java Properties files use # for comments
  let props = '';

  // Group by context and add as comments
  const propsTranslationsByContext: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const context = translation.context || '';
    if (!propsTranslationsByContext[context]) {
      propsTranslationsByContext[context] = [];
    }
    propsTranslationsByContext[context].push(translation);
  }

  // Write properties with context comments
  for (const [context, contextTranslations] of Object.entries(propsTranslationsByContext)) {
    if (context) {
      props += `\n# Context: ${context}\n`;
    } else {
      props += '\n# Global translations\n';
    }

    for (const translation of contextTranslations) {
      // Escape special characters
      const escapedValue =
        typeof translation.value === 'string'
          ? translation.value.replace(/\\/g, '\\\\').replace(/=/g, '\\=').replace(/:/g, '\\:').replace(/\n/g, '\\n')
          : translation.value;
      props += `${translation.key}=${escapedValue}\n`;
    }
  }

  return props;
};
