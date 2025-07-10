import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/api/v1', 
   headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Biến để theo dõi trạng thái refresh token    
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

// Hàm xử lý queue khi refresh token
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Hàm lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Hàm lấy refresh token
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Hàm lưu token
const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Hàm xóa token
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Thêm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // Gọi API refresh token
          const response = await axios.get('/auth/refresh', {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Lưu token mới
          saveTokens(accessToken, newRefreshToken);
          
          // Xử lý các request trong queue
          processQueue(null, accessToken);
          
          // Retry original request với token mới
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Refresh token thất bại
          processQueue(refreshError, null);
          clearTokens();
          
          // Redirect về trang login
          window.location.href = '/auth/login/student';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token, redirect về login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;