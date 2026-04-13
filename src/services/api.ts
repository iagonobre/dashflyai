import axios, { InternalAxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuthInterceptor?: boolean;
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Always inject auth token — skipAuthInterceptor only controls response retry logic
  const cookies = parseCookies();
  const token = cookies.access_token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest?.skipAuthInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token =
          typeof window !== "undefined"
            ? localStorage.getItem("refresh_token")
            : null;

        if (!refresh_token) {
          throw new Error("Sem refresh token disponível.");
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token }
        );

        const {
          access_token,
          refresh_token: new_refresh_token,
        } = response.data;

        setCookie(null, "access_token", access_token, {
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
          secure: true,
          sameSite: "strict",
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", new_refresh_token);
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch {
        destroyCookie(null, "access_token");

        if (typeof window !== "undefined") {
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
