import { Injectable } from '@angular/core';
import { createClient, OAuthResponse, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      console.log('Auth session:', session);
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
}
