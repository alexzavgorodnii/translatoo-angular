import { Injectable } from '@angular/core';
import { createClient, OAuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { Project, ProjectWithLanguages } from '../models/projects';
import { Language, LanguageWithTranslations } from '../models/languages';
import { Translation } from '../models/translations';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private user: User | null = null;
  get currentUser(): User | null {
    return this.user;
  }
  private supabase: SupabaseClient;
  get currentSupabase(): SupabaseClient {
    return this.supabase;
  }
  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.user = session?.user ?? null;
      }
    });
  }

  googleLogin(): Observable<OAuthResponse> {
    return new Observable(observer => {
      this.supabase.auth
        .signInWithOAuth({ provider: 'google' })
        .then(response => {
          observer.next(response);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      this.supabase.auth
        .signOut()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  isAuth(): Observable<boolean> {
    return new Observable(observer => {
      this.supabase.auth.getSession().then(response => {
        observer.next(response.data.session !== null);
        observer.complete();
      });
    });
  }

  getProjects(): Observable<Project[]> {
    return new Observable(observer => {
      this.supabase
        .from('project')
        .select('*')
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as Project[]);
            observer.complete();
          }
        });
    });
  }

  getProject(id: string): Observable<ProjectWithLanguages> {
    return new Observable(observer => {
      this.supabase
        .from('project')
        .select('*, languages:language(*, translations:translation(*))')
        .match({ id })
        .single()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as ProjectWithLanguages);
            observer.complete();
          }
        });
    });
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

  addProject(name: string): Observable<Project> {
    return new Observable(observer => {
      this.supabase
        .from('project')
        .insert({ name })
        .select()
        .single()
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data as Project);
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
}
