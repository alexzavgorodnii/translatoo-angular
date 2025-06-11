import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { Translation, TranslationFromFile } from '../../../core/models/translations';
import { SupabaseTranslationsApi } from '../../../core/services/supabase-api.service';

@Injectable({
  providedIn: 'root',
})
export class TranslationsService extends SupabaseTranslationsApi {
  constructor() {
    super();
  }

  addTranslations(translate: Translation[]): Observable<Translation[]> {
    return new Observable(observer => {
      this.supabase
        .from('translation')
        .insert(translate)
        .select()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as Translation[]);
            observer.complete();
          }
        });
    });
  }

  importScriptTranslations(
    languageId: string,
    newTranslations: TranslationFromFile[],
    updateTranslations: TranslationFromFile[],
    deleteTranslations: TranslationFromFile[],
    tag: string,
  ): Observable<void> {
    return new Observable(observer => {
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

      const insert$ =
        translationsToInsert.length > 0
          ? this.supabase.from('translation').insert(translationsToInsert).select()
          : Promise.resolve({ error: null, data: [] });
      const delete$ =
        translationsToDelete.length > 0
          ? this.supabase.from('translation').delete().in('id', ids)
          : Promise.resolve({ error: null, data: [] });
      const update$ =
        translationsToUpdate.length > 0
          ? this.supabase.from('translation').upsert(translationsToUpdate, { onConflict: 'id' }).select()
          : Promise.resolve({ error: null, data: [] });

      forkJoin([insert$, delete$, update$]).subscribe({
        next: ([insertRes, deleteRes, updateRes]) => {
          if (insertRes.error) return observer.error(insertRes.error);
          if (deleteRes && deleteRes.error) return observer.error(deleteRes.error);
          if (updateRes && updateRes.error) return observer.error(updateRes.error);
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err),
      });
    });
  }

  updateTranslationValue(id: number, value: string): Observable<Translation> {
    return new Observable(observer => {
      this.supabase
        .from('translation')
        .update({ value, temp_value: null })
        .eq('id', id)
        .select()
        .single()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as Translation);
            observer.complete();
          }
        });
    });
  }
}
