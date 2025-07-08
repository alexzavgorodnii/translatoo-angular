import { Injectable } from '@angular/core';
import { UserApi } from '../../../core/services/api.service';
import { Observable } from 'rxjs/internal/Observable';
import { User } from 'shared-types';

@Injectable({
  providedIn: 'root',
})
export class UserService extends UserApi {
  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
  updateUser(id: string, name: string, email: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile/${id}`, { name, email });
  }
  updateUserPassword(id: string, password: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile/${id}/password`, { password });
  }
}
