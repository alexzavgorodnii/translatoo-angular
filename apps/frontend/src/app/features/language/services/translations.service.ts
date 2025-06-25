import { Injectable } from '@angular/core';
import { TranslationFromFile } from '../../../core/models/translations';
import { SupabaseTranslationsApi } from '../../../core/services/api.service';
import { Translation } from 'shared-types';

@Injectable({
  providedIn: 'root',
})
export class TranslationsService extends SupabaseTranslationsApi {
  constructor() {
    super();
  }

  async addTranslations(translate: Translation[]): Promise<Translation[]> {
    const { data, error } = await this.supabase.from('translation').insert(translate).select();
    if (error) {
      throw error;
    }
    return (data as Translation[]) || [];
  }

  async importScriptTranslations(
    languageId: string,
    newTranslations: TranslationFromFile[],
    updateTranslations: TranslationFromFile[],
    deleteTranslations: TranslationFromFile[],
    tag: string,
  ): Promise<void> {
    const translationsToInsert = newTranslations.map(t => ({
      language_id: languageId,
      key: t.key,
      value: t.value,
      context: t.context || null,
      comment: t.comment || null,
      is_plural: t.is_plural || false,
      plural_key: t.plural_key || null,
      order: t.order || 0,
      tag: tag && tag.length > 0 ? tag : null,
    }));

    const translationsToUpdate = updateTranslations.map(t => ({
      language_id: languageId,
      id: t.id!,
      key: t.key,
      value: t.value,
      context: t.context || null,
      comment: t.comment || null,
      is_plural: t.is_plural || false,
      plural_key: t.plural_key || null,
      order: t.order || 0,
      tag: tag && tag.length > 0 ? tag : null,
    }));

    const translationsToDelete = deleteTranslations.map(t => ({
      id: t.id!,
    }));

    const ids = translationsToDelete.map(t => t.id);

    const insertPromise =
      translationsToInsert.length > 0
        ? this.supabase.from('translation').insert(translationsToInsert).select()
        : Promise.resolve({ error: null, data: [] });
    const deletePromise =
      translationsToDelete.length > 0
        ? this.supabase.from('translation').delete().in('id', ids)
        : Promise.resolve({ error: null, data: [] });
    const updatePromise =
      translationsToUpdate.length > 0
        ? this.supabase.from('translation').upsert(translationsToUpdate, { onConflict: 'id' }).select()
        : Promise.resolve({ error: null, data: [] });

    const [insertRes, deleteRes, updateRes] = await Promise.all([insertPromise, deletePromise, updatePromise]);

    if (insertRes.error) throw insertRes.error;
    if (deleteRes && deleteRes.error) throw deleteRes.error;
    if (updateRes && updateRes.error) throw updateRes.error;
  }

  async updateTranslationValue(id: number, value: string): Promise<Translation> {
    const { data, error } = await this.supabase
      .from('translation')
      .update({ value, temp_value: null })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return data as Translation;
  }
}
