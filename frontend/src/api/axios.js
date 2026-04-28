import axios from 'axios';

const API = axios.create({
baseURL: 'https://online-exam-system-yb28.onrender.com/api'
});

// Every request la automatically token add pannum
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;