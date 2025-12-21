import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLogin } from '../../apis/login';
import { axiosPrivate } from '../../apis/axios';

// Mock axios
vi.mock('../../apis/axios', () => ({
  axiosPrivate: {
    post: vi.fn(),
  },
}));

describe('Login API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully logs in with valid credentials', async () => {
    const mockResponse = {
      data: {
        data: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          user: {
            id: '1',
            email: 'test@example.com',
            fullName: 'Test User',
          },
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockResolvedValue(mockResponse);

    const result = await fetchLogin('test@example.com', 'password123');

    expect(axiosPrivate.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toEqual({
      user: mockResponse.data.data.user,
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      error: null,
    });
  });

  it('returns unverified error for unverified accounts', async () => {
    const mockError = {
      response: {
        status: 403,
        data: {
          error: 'Tài khoản của bạn chưa được xác thực',
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockRejectedValue(mockError);

    const result = await fetchLogin('unverified@example.com', 'password123');

    expect(result).toEqual({
      user: { email: 'unverified@example.com', isVerified: false },
      error: 'unverified',
    });
  });

  it('throws error for invalid credentials', async () => {
    const mockError = {
      response: {
        status: 401,
        data: {
          error: 'Invalid credentials',
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockRejectedValue(mockError);

    await expect(fetchLogin('test@example.com', 'wrongpassword')).rejects.toEqual(mockError);
  });

  it('throws error for locked accounts', async () => {
    const mockError = {
      response: {
        status: 403,
        data: {
          error: 'Tài khoản đã bị khóa',
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockRejectedValue(mockError);

    await expect(fetchLogin('locked@example.com', 'password123')).rejects.toEqual(mockError);
  });

  it('throws error for network issues', async () => {
    const mockError = new Error('Network Error');

    vi.mocked(axiosPrivate.post).mockRejectedValue(mockError);

    await expect(fetchLogin('test@example.com', 'password123')).rejects.toThrow('Network Error');
  });

  it('handles empty credentials', async () => {
    const mockResponse = {
      data: {
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: '1' },
        },
      },
    };

    vi.mocked(axiosPrivate.post).mockResolvedValue(mockResponse);

    await fetchLogin('', '');

    expect(axiosPrivate.post).toHaveBeenCalledWith('/api/auth/login', {
      email: '',
      password: '',
    });
  });
});
