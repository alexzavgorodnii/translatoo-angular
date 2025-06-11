import { signal } from '@angular/core';
import { createClient, OAuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Language, LanguageWithTranslations } from '../models/languages';
import { Project, ProjectWithLanguages } from '../models/projects';
import { Translation, TranslationFromFile } from '../models/translations';

export abstract class SupabaseApiBase {
  private readonly _supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  get supabase(): SupabaseClient {
    return this._supabase;
  }
}

export abstract class SupabaseAuthApi extends SupabaseApiBase {
  private _user = signal<User | null>(null);
  get user(): User | null {
    return this._user();
  }
  set user(value: User | null) {
    this._user.set(value);
  }
  abstract googleLogin(): Observable<OAuthResponse>;
  abstract logout(): Observable<void>;
  abstract isAuth(): Observable<boolean>;
}

export abstract class SupabaseTranslationsApi extends SupabaseApiBase {
  abstract addTranslations(translate: Translation[]): Observable<Translation[]>;
  abstract importScriptTranslations(
    languageId: string,
    newTranslations: TranslationFromFile[],
    updateTranslations: TranslationFromFile[],
    deleteTranslations: TranslationFromFile[],
    tag: string,
  ): Observable<void>;
  abstract updateTranslationValue(id: number, value: string): Observable<Translation>;
}

export abstract class SupabaseLanguagesApi extends SupabaseApiBase {
  abstract addLanguage(name: string, project_id: string): Observable<Language>;
  abstract getLanguage(id: string): Observable<LanguageWithTranslations>;
}

export abstract class SupabaseProjectsApi extends SupabaseApiBase {
  abstract getProjects(): Observable<Project[]>;
  abstract getProject(id: string): Observable<ProjectWithLanguages>;
  abstract getOnlyProject(id: string): Observable<Project>;
  abstract addProject(name: string): Observable<Project>;
}
