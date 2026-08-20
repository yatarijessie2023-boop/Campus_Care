import { defineStore } from 'pinia';
import api from '../services/api';
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('admin_token'), user: JSON.parse(localStorage.getItem('admin_user') || 'null') }),
  getters: { isLoggedIn: state => Boolean(state.token) },
  actions: {
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      this.token = data.data.token; this.user = data.data.user;
      localStorage.setItem('admin_token', this.token); localStorage.setItem('admin_user', JSON.stringify(this.user));
    },
    logout() { this.token = null; this.user = null; localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); }
  }
});
