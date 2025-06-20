import { Injectable } from '@angular/core';
import { LanguageWithTranslations, Language } from '../../../core/models/languages';
import { SupabaseLanguagesApi } from '../../../core/services/supabase-api.service';

@Injectable({
  providedIn: 'root',
})
export class LanguagesService extends SupabaseLanguagesApi {
  constructor() {
    super();
  }

  async getLanguage(id: string): Promise<LanguageWithTranslations> {
    const { data, error } = await this.supabase
      .from('language')
      .select('* , translations:translation(*)')
      .match({ id })
      .order('order', { referencedTable: 'translation', ascending: true })
      .single();
    if (error) {
      throw error;
    }
    return data as LanguageWithTranslations;
  }

  async addLanguage(name: string, project_id: string): Promise<Language> {
    const { data, error } = await this.supabase.from('language').insert({ name, project_id }).select().single();
    if (error) {
      throw error;
    }
    return data as Language;
  }
}
