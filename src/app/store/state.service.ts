import { Injectable, signal } from '@angular/core';
import { ProjectWithLanguages } from '../../models/projects';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private _project = signal<ProjectWithLanguages>({
    id: '',
    created_at: '',
    name: '',
    languages: [],
  });

  set project(project: ProjectWithLanguages) {
    this._project.set(project);
  }

  get project(): ProjectWithLanguages {
    return this._project();
  }

  updateProjectLanguages(languages: ProjectWithLanguages['languages']): void {
    const currentProject = this._project();
    this._project.set({
      ...currentProject,
      languages: languages,
    });
  }
}
