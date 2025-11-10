import axios from "./axios";

export const verifyEmailApi = async (token) => {
  try {
    const response = await axios.post(
      '/api/auth/verify', 
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Verify email API error:', error);
    throw error;
  }
};