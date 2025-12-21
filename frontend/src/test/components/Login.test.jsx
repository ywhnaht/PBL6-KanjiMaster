import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginModal from '../../components/Login/index';
import { useAuthStore } from '../../store/useAuthStore';
import * as loginApi from '../../apis/login';

// Mock modules
vi.mock('../../apis/login');
vi.mock('../../store/useAuthStore');
vi.mock('../../store/useDarkModeStore', () => ({
  default: () => ({ isDark: false }),
}));

describe('LoginModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToRegister = vi.fn();
  const mockOnLoginSuccess = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      login: mockLogin,
    });
  });

  const renderLoginModal = () => {
    return render(
      <BrowserRouter>
        <LoginModal
          onClose={mockOnClose}
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderLoginModal();

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockResult = {
      user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      error: null,
    };

    vi.mocked(loginApi.fetchLogin).mockResolvedValue(mockResult);

    renderLoginModal();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginApi.fetchLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: mockResult.user,
      });
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it('displays error for unverified account', async () => {
    const mockResult = {
      user: { email: 'test@example.com', isVerified: false },
      error: 'unverified',
    };

    vi.mocked(loginApi.fetchLogin).mockResolvedValue(mockResult);

    renderLoginModal();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/tài khoản chưa được xác thực/i)).toBeInTheDocument();
    });
  });

  it('displays error for invalid credentials', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { error: 'Invalid credentials' },
      },
    };

    vi.mocked(loginApi.fetchLogin).mockRejectedValue(mockError);

    renderLoginModal();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email hoặc mật khẩu không đúng/i)).toBeInTheDocument();
    });
  });

  it('validates empty form submission', async () => {
    renderLoginModal();

    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
    fireEvent.click(submitButton);

    // Form should not submit with empty fields
    expect(loginApi.fetchLogin).not.toHaveBeenCalled();
  });

  it('switches to register modal', () => {
    renderLoginModal();

    const registerLink = screen.getByText(/đăng ký/i);
    fireEvent.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('disables submit button during loading', async () => {
    vi.mocked(loginApi.fetchLogin).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderLoginModal();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
