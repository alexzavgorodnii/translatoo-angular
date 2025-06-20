import { Injectable } from '@angular/core';
import { Store } from '../../../core/services/store.service';
import { ProjectWithLanguages } from '../../../core/models/projects';

interface ProjectStoreState {
  project: ProjectWithLanguages;
  loading: boolean;
  isError: boolean;
}

const initialState: ProjectStoreState = {
  project: {
    id: '',
    created_at: '',
    name: '',
    languages: [],
  },
  loading: true,
  isError: false,
};

@Injectable({
  providedIn: 'root',
})
export class ProjectStore extends Store<ProjectStoreState> {
  readonly project = this.select(state => state.project);
  readonly loading = this.select(state => state.loading);
  readonly isError = this.select(state => state.isError);

  constructor() {
    super(initialState);
  }

  setProject(project: ProjectWithLanguages): void {
    this.setState({ project });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(isError: boolean): void {
    this.setState({ isError });
  }

  updateProjectLanguages(languages: ProjectWithLanguages['languages']): void {
    const currentProject = this.project();
    this.setState({
      project: {
        ...currentProject,
        languages: languages,
      },
    });
  }
}
