import axios from 'axios';

// 尝试从localStorage和redux中获取token
function getToken() {
  // 优先从localStorage获取
  const token = localStorage.getItem('token');
  if (token) return token;
  // 兼容redux-persist未启用时的情况
  try {
    const state = JSON.parse(window.localStorage.getItem('persist:root'));
    if (state && state.user) {
      const userState = JSON.parse(state.user);
      return userState.token;
    }
  } catch {}
  return null;
}

const instance = axios.create();

instance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;
