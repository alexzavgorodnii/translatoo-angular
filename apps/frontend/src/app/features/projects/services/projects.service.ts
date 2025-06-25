import { Injectable } from '@angular/core';
import { ProjectWithLanguages } from '../../../core/models/projects';
import { SupabaseProjectsApi } from '../../../core/services/api.service';
import { Project } from 'shared-types';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends SupabaseProjectsApi {
  constructor() {
    super();
  }

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase.from('project').select('*');
    if (error) {
      throw error;
    }
    return (data as Project[]) || [];
  }

  async getProject(id: string): Promise<ProjectWithLanguages> {
    const { data, error } = await this.supabase
      .from('project')
      .select('*, languages:language(*, translations:translation(*))')
      .match({ id })
      .single();
    if (error) {
      throw error;
    }
    return data as ProjectWithLanguages;
  }

  async getOnlyProject(id: string): Promise<Project> {
    const { data, error } = await this.supabase.from('project').select('*').match({ id }).single();
    if (error) {
      throw error;
    }
    return data as Project;
  }

  async addProject(name: string): Promise<Project> {
    const { data, error } = await this.supabase.from('project').insert({ name }).select().single();
    if (error) {
      throw error;
    }
    return data as Project;
  }
}
