import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../src/services/auth.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => {
  const actual = jest.requireActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: jest.fn(),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabaseClient: Partial<SupabaseClient>;

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: jest.fn().mockResolvedValue({}),
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      } as any,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call signInWithOAuth with google provider after call googleLogin', async () => {
    service.googleLogin().subscribe(response => {
      expect(response).toEqual({ data: {}, error: null });
    });
    expect(mockSupabaseClient.auth!.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
  });

  it('should call signOut after call logout', async () => {
    service.logout().subscribe(() => {
      expect(true).toBeTruthy();
    });
    expect(mockSupabaseClient.auth!.signOut).toHaveBeenCalled();
  });

  it('should return true if user is authenticated', done => {
    service.isAuth().subscribe(isAuthenticated => {
      expect(isAuthenticated).toBe(true);
      done();
    });
  });
});
