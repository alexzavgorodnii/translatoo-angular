import { Injectable } from '@angular/core';
import { SupabaseAuthApi } from './supabase-api.service';
import { Observable } from 'rxjs/internal/Observable';
import { OAuthResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends SupabaseAuthApi {
  constructor() {
    super();
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
}
