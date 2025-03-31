import { Language } from './languages';

export interface Project {
  id: string;
  created_at: string;
  name: string;
}

export type ProjectWithLanguages = Project & {
  languages: Language[];
};
