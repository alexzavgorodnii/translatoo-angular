import { Injectable } from '@angular/core';
import { SupabaseProjectsApi } from './supabase-api.service';
import { Observable } from 'rxjs';
import { Project, ProjectWithLanguages } from '../models/projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends SupabaseProjectsApi {
  constructor() {
    super();
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

  getOnlyProject(id: string): Observable<Project> {
    return new Observable(observer => {
      this.supabase
        .from('project')
        .select('*')
        .match({ id })
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
}
