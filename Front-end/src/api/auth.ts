import axios from 'axios';

// Base URL for the API
const BASE_URL = 'http://34.56.162.48:8087/api/v1';

// Login request interface
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  };
}

// Login API function
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const apiUrl = `${BASE_URL}/auth/login`;
    console.log('API CALL:', apiUrl);
    const response = await axios.post(apiUrl, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    return {
      success: true,
      message: 'Login successful',
      data: response.data,
    };
  } catch (error: any) {
    console.error('Login API error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Invalid credentials',
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Other error
      return {
        success: false,
        message: 'An unexpected error occurred.',
      };
    }
  }
}
