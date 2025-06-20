import { signal } from '@angular/core';
import { createClient, OAuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LanguageWithTranslations } from '../models/languages';
import { ProjectWithLanguages } from '../models/projects';
import { TranslationFromFile } from '../models/translations';
import { Language, Project, Translation } from 'shared-types';

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
  abstract addTranslations(translate: Translation[]): Promise<Translation[]>;
  abstract importScriptTranslations(
    languageId: string,
    newTranslations: TranslationFromFile[],
    updateTranslations: TranslationFromFile[],
    deleteTranslations: TranslationFromFile[],
    tag: string,
  ): Promise<void>;
  abstract updateTranslationValue(id: number, value: string): Promise<Translation>;
}

export abstract class SupabaseLanguagesApi extends SupabaseApiBase {
  abstract addLanguage(name: string, project_id: string): Promise<Language>;
  abstract getLanguage(id: string): Promise<LanguageWithTranslations>;
}

export abstract class SupabaseProjectsApi extends SupabaseApiBase {
  abstract getProjects(): Promise<Project[]>;
  abstract getProject(id: string): Promise<ProjectWithLanguages>;
  abstract getOnlyProject(id: string): Promise<Project>;
  abstract addProject(name: string): Promise<Project>;
}
