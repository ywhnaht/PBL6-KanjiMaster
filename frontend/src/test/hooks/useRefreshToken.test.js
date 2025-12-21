import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useRefreshToken from '../../hooks/useRefreshToken';
import { axiosPrivate } from '../../apis/axios';
import { useAuthStore } from '../../store/useAuthStore';

// Mock modules
vi.mock('../../apis/axios', () => ({
  axiosPrivate: {
    post: vi.fn(),
  },
}));

vi.mock('../../store/useAuthStore');

describe('useRefreshToken Hook', () => {
  const mockSetTokens = vi.fn();
  const mockRefreshToken = 'old-refresh-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockImplementation((selector) => {
      const state = {
        refreshToken: mockRefreshToken,
        setTokens: mockSetTokens,
      };
      return selector(state);
    });
  });

  it('successfully refreshes access token', async () => {
    const newAccessToken = 'new-access-token-456';
    const mockResponse = {
      data: {
        data: {
          accessToken: newAccessToken,
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRefreshToken());

    let returnedToken;
    await waitFor(async () => {
      returnedToken = await result.current();
    });

    expect(axiosPrivate.post).toHaveBeenCalledWith(
      '/api/auth/refresh',
      {},
      {
        headers: { 'x-refresh-token': mockRefreshToken },
      }
    );
    expect(mockSetTokens).toHaveBeenCalledWith({
      accessToken: newAccessToken,
      refreshToken: mockRefreshToken,
    });
    expect(returnedToken).toBe(newAccessToken);
  });

  it('throws error when refresh fails', async () => {
    const mockError = new Error('Refresh failed');
    vi.mocked(axiosPrivate.post).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRefreshToken());

    await expect(result.current()).rejects.toThrow('Refresh failed');
    expect(mockSetTokens).not.toHaveBeenCalled();
  });

  it('handles missing refresh token', async () => {
    useAuthStore.mockImplementation((selector) => {
      const state = {
        refreshToken: null,
        setTokens: mockSetTokens,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useRefreshToken());

    vi.mocked(axiosPrivate.post).mockResolvedValue({
      data: { data: { accessToken: 'new-token' } },
    });

    await waitFor(async () => {
      await result.current();
    });

    expect(axiosPrivate.post).toHaveBeenCalledWith(
      '/api/auth/refresh',
      {},
      {
        headers: { 'x-refresh-token': null },
      }
    );
  });
});
