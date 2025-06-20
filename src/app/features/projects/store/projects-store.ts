import { Injectable } from '@angular/core';
import { Store } from '../../../core/services/store.service';
import { Project } from '../../../core/models/projects';

interface ProjectsStoreState {
  projects: Project[];
  loading: boolean;
  isError: boolean;
}

const initialState: ProjectsStoreState = {
  projects: [],
  loading: true,
  isError: false,
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsStore extends Store<ProjectsStoreState> {
  readonly projects = this.select(state => state.projects);
  readonly loading = this.select(state => state.loading);
  readonly isError = this.select(state => state.isError);

  constructor() {
    super(initialState);
  }

  setProjects(projects: Project[]): void {
    this.setState({ projects });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(isError: boolean): void {
    this.setState({ isError });
  }
}
