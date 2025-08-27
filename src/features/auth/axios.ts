import baseAxios from "./baseAxios";
import { store } from "../../app/store";
import { refreshTokenByRole, logout } from "./authSlice";

const axiosInstance = baseAxios;

// ⬇️ Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⬇️ Auto-refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;
      try {
        const result = await store.dispatch(refreshTokenByRole()).unwrap();
        originalRequest.headers.Authorization = `Bearer ${result.token}`;
        return axiosInstance(originalRequest);
      } catch {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
