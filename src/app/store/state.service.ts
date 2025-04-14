import { Injectable, signal } from '@angular/core';
import { ProjectWithLanguages } from '../../models/projects';
import { LanguageWithTranslations } from '../../models/languages';

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

  private _language = signal<LanguageWithTranslations>({
    id: '',
    name: '',
    project_id: '',
    created_at: '',
    format: '',
    app_type: '',
    translations: [],
  });

  set project(project: ProjectWithLanguages) {
    this._project.set(project);
  }

  get project(): ProjectWithLanguages {
    return this._project();
  }

  set language(language: LanguageWithTranslations) {
    this._language.set(language);
  }

  get language(): LanguageWithTranslations {
    return this._language();
  }

  updateProjectLanguages(languages: ProjectWithLanguages['languages']): void {
    const currentProject = this._project();
    this._project.set({
      ...currentProject,
      languages: languages,
    });
  }

  updateLanguage(language: LanguageWithTranslations): void {
    this._language.set(language);
  }
}
