import axios from "axios";
import { API_BASE_URL } from "../../constants/config";
import { store } from "../../app/store";
import { refreshStudentToken, logout } from "./authSlice";
import { resetStudent } from "../student/studentSlice";

const studentAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
studentAxios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    const role = state.auth.role;
    
    if (token && role === 'student') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
studentAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = store.getState();
        const role = state.auth.role;
        
        if (role === 'student') {
          await store.dispatch(refreshStudentToken()).unwrap();
          
          // Retry the original request with new token
          const newState = store.getState();
          const newToken = newState.auth.token;
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return studentAxios(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout the user
        store.dispatch(logout());
        store.dispatch(resetStudent());
        window.location.href = '/student/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default studentAxios;
