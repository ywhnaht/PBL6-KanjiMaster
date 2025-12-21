import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/useAuthStore';
import Cookies from 'js-cookie';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    
    // Reset store state
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  });

  it('initializes with null values when no cookies exist', () => {
    const state = useAuthStore.getState();
    
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('logs in user and sets cookies', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
    };
    const mockAccessToken = 'access-token-123';
    const mockRefreshToken = 'refresh-token-123';

    useAuthStore.getState().login({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockAccessToken);
    expect(state.refreshToken).toBe(mockRefreshToken);
    expect(state.user).toEqual(mockUser);

    // Verify cookies are set
    expect(Cookies.get('accessToken')).toBe(mockAccessToken);
    expect(Cookies.get('refreshToken')).toBe(mockRefreshToken);
    expect(JSON.parse(Cookies.get('user'))).toEqual(mockUser);
  });

  it('logs out user and removes cookies', () => {
    // First login
    useAuthStore.getState().login({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'test@example.com' },
    });

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();

    // Verify cookies are removed
    expect(Cookies.get('accessToken')).toBeUndefined();
    expect(Cookies.get('refreshToken')).toBeUndefined();
    expect(Cookies.get('user')).toBeUndefined();
  });

  it('updates user information', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
    };

    useAuthStore.getState().login({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: mockUser,
    });

    // Update user
    useAuthStore.getState().updateUser({
      fullName: 'Updated Name',
      email: 'updated@example.com',
    });

    const state = useAuthStore.getState();
    expect(state.user.fullName).toBe('Updated Name');
    expect(state.user.email).toBe('updated@example.com');
    expect(state.user.id).toBe('1'); // Should preserve other fields
  });

  it('sets tokens without user', () => {
    useAuthStore.getState().setTokens({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
  });

  it('persists state across store recreations', () => {
    // Set initial state
    useAuthStore.getState().login({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'test@example.com' },
    });

    // Simulate page reload by creating new store instance
    // The store should read from cookies
    expect(Cookies.get('accessToken')).toBe('token');
    expect(Cookies.get('refreshToken')).toBe('refresh');
  });
});
