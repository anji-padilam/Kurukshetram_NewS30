import axios from "axios";
import { API_BASE_URL } from "@/config/api";

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return "/api";
  }
  // In production (Vercel), use the proxy as well since we have API routes
  return "/api";
};

// Fallback URL for direct API calls (if proxy fails)
const getFallbackURL = () => API_BASE_URL;

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to all requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('JWT token added to request');
    } else {
      console.log('No JWT token found in localStorage');
    }
    
    // Add any request modifications here if needed
    console.log('Making API request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    
    // Add mobile-specific headers for better debugging
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
      config.headers['X-Client-Type'] = 'mobile';
      config.headers['X-User-Agent'] = userAgent;
      console.log('Mobile device detected, adding mobile headers');
    } else {
      config.headers['X-Client-Type'] = 'desktop';
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const err = error as any;
    
    // Suppress 404 errors for comments API (not implemented yet)
    if (err?.response?.status === 404 && err?.config?.url?.includes('/comments')) {
      // Don't log 404 errors for comments API
    } else {
      console.error("API Error:", {
        message: err?.message,
        url: err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
        type: err?.type
      });
    }

    // Handle CORS errors specifically
    if (err?.message?.includes('CORS') || err?.code === 'ERR_BLOCKED_BY_CLIENT' || err?.message?.includes('Access-Control-Allow-Origin')) {
      console.warn('CORS error detected, this should be handled by the proxy');
      return Promise.reject({
        message: "Connection error. Please refresh the page and try again.",
        status: 0,
        type: 'CORS_ERROR'
      });
    }

    // Handle different error types
    if (err?.code === 'ERR_NETWORK') {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        status: 0,
        type: 'NETWORK_ERROR'
      });
    }

    if (err?.response?.status === 404) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Suppress 404 error details for comments API
      if (!err?.config?.url?.includes('/comments')) {
        console.error('404 Error Details:', {
          url: err?.config?.url,
          method: err?.config?.method,
          headers: err?.config?.headers,
          userAgent: navigator.userAgent,
          isMobile: isMobile
        });
      }
      
      // Provide more helpful error messages for different endpoints
      let errorMessage = "Unable to load data. Please try again later.";
      
      // Specific error messages for different endpoints
      if (err?.config?.url?.includes('/news/categories')) {
        errorMessage = "Unable to load categories. Please try again later.";
      } else if (err?.config?.url?.includes('/news/languages')) {
        errorMessage = "Unable to load languages. Please try again later.";
      } else if (err?.config?.url?.includes('/news/states')) {
        errorMessage = "Unable to load states. Please try again later.";
      } else if (err?.config?.url?.includes('/news/districts')) {
        errorMessage = "Unable to load districts. Please try again later.";
      } else if (err?.config?.url?.includes('/news/')) {
        errorMessage = "Unable to load news. Please try again later.";
      } else if (err?.config?.url?.includes('/comments')) {
        errorMessage = "Unable to load comments. Please try again later.";
      } else if (err?.config?.url?.includes('/auth/')) {
        errorMessage = "Authentication error. Please try again later.";
      } else if (isMobile && err?.config?.url?.includes('forgot-password')) {
        errorMessage = "Unable to send OTP. Please check your internet connection and try again.";
      } else if (isMobile && err?.config?.url?.includes('verify-code')) {
        errorMessage = "Unable to verify OTP. Please check your internet connection and try again.";
      } else if (isMobile && err?.config?.url?.includes('reset-password')) {
        errorMessage = "Unable to reset password. Please check your internet connection and try again.";
      } else if (isMobile) {
        errorMessage = "Connection issue detected. Please check your internet and try again.";
      }
      
      return Promise.reject({
        message: errorMessage,
        status: 404,
        type: 'NOT_FOUND',
        details: {
          url: err?.config?.url,
          isMobile: isMobile
        }
      });
    }

    if (err?.response?.status === 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
        status: 500,
        type: 'SERVER_ERROR'
      });
    }

    if (err?.response?.status === 503) {
      return Promise.reject({
        message: "Service is currently unavailable. Please try again later.",
        status: 503,
        type: 'SERVICE_UNAVAILABLE'
      });
    }

    if (err?.response?.status === 403) {
      return Promise.reject({
        message: "Access denied. Please check your permissions.",
        status: 403,
        type: 'FORBIDDEN'
      });
    }

    // Handle timeout errors
    if (err?.code === 'ECONNABORTED') {
      return Promise.reject({
        message: "Request timeout. Please try again.",
        status: 0,
        type: 'TIMEOUT_ERROR'
      });
    }

    return Promise.reject(
      err?.response?.data || { 
        message: "Something went wrong. Please try again later.",
        status: err?.response?.status || 0,
        type: 'UNKNOWN_ERROR'
      }
    );
  }
);

export default apiClient;