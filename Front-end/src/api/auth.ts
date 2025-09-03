import axios from 'axios';
import { getCurrentConfig } from './config';

// Get current API configuration
const config = getCurrentConfig();
const BASE_URL = config.baseURL;

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
    const apiUrl = `${BASE_URL}auth/login`;
    console.log('API CALL:', apiUrl);
    const response = await axios.post(apiUrl, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: config.timeout,
    });

    return {
      success: true,
      message: 'Login successful',
      data: response.data,
    };
  } catch (error: any) {
    console.error('Login API error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Invalid credentials',
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred.',
      };
    }
  }
}
