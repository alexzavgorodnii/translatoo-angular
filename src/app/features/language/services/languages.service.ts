import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageWithTranslations, Language } from '../../../core/models/languages';
import { SupabaseLanguagesApi } from '../../../core/services/supabase-api.service';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService extends SupabaseLanguagesApi {
  constructor() {
    super();
  }

  getLanguage(id: string): Observable<LanguageWithTranslations> {
    return new Observable(observer => {
      this.supabase
        .from('language')
        .select('* , translations:translation(*)')
        .match({ id })
        .order('order', { referencedTable: 'translation', ascending: true })
        .single()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as LanguageWithTranslations);
            observer.complete();
          }
        });
    });
  }

  addLanguage(name: string, project_id: string): Observable<Language> {
    return new Observable(observer => {
      this.supabase
        .from('language')
        .insert({ name, project_id })
        .select()
        .single()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as Language);
            observer.complete();
          }
        });
    });
  }
}
