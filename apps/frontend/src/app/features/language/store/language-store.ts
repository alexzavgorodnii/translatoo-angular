import { Injectable } from '@angular/core';
import { Store } from '../../../core/services/store.service';
import { LanguageWithTranslations } from '../../../core/models/languages';

interface LanguageStoreState {
  language: LanguageWithTranslations;
  loading: boolean;
  isError: boolean;
}

const initialState: LanguageStoreState = {
  language: {
    id: '',
    name: 'Loading...',
    project_id: '',
    created_at: '',
    format: '',
    app_type: '',
    translations: [],
  },
  loading: true,
  isError: false,
};

@Injectable({
  providedIn: 'root',
})
export class LanguageStore extends Store<LanguageStoreState> {
  readonly language = this.select(state => state.language);
  readonly loading = this.select(state => state.loading);
  readonly isError = this.select(state => state.isError);

  constructor() {
    super(initialState);
  }

  setLanguage(language: LanguageWithTranslations): void {
    this.setState({ language });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setError(isError: boolean): void {
    this.setState({ isError });
  }
}
