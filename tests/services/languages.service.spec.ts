import { TestBed } from '@angular/core/testing';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LanguagesService } from '../../src/app/features/language/services/languages.service';
import { Language } from '../../src/app/core/models/languages';

jest.mock('@supabase/supabase-js', () => {
  const actual = jest.requireActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: jest.fn(),
  };
});

describe('LanguagesService', () => {
  let service: LanguagesService;
  let mockSupabaseClient: Partial<SupabaseClient>;
  const mockLanguageResponse = {
    data: { id: '1', name: 'English', translations: [] },
    error: null,
  };
  const mockInsertResponse: {
    data: Language;
    error: null;
  } = {
    data: {
      id: '1',
      name: 'Spanish',
      project_id: '123',
      created_at: '2023-10-01T00:00:00Z',
      format: 'json',
      app_type: 'web',
    },
    error: null,
  };

  beforeEach(() => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(mockLanguageResponse),
      insert: jest.fn().mockReturnThis(),
    } as any;

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    TestBed.configureTestingModule({
      providers: [LanguagesService],
    });
    service = TestBed.inject(LanguagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call supabase.from().select() with correct parameters after getLanguage', done => {
    service.getLanguage('1').subscribe(language => {
      expect(language).toEqual(mockLanguageResponse.data);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('language');
      done();
    });
  });

  it('should call supabase.from().insert() with correct parameters after addLanguage', done => {
    const newLanguage = { name: 'Spanish', project_id: '123' };

    (mockSupabaseClient as any).single = jest.fn().mockResolvedValue(mockInsertResponse);
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    service.addLanguage(newLanguage.name, newLanguage.project_id).subscribe(language => {
      expect(language).toEqual(mockInsertResponse.data);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('language');
      done();
    });
  });
});
