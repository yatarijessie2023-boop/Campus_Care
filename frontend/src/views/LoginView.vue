<script setup>
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const form = reactive({ username: '', password: '' });
const error = ref('');
const accountHint = ref('');
const checking = ref(false);
const auth = useAuthStore();
const router = useRouter();

let checkTimer = null;
watch(
  () => form.username,
  (username) => {
    error.value = '';
    accountHint.value = '';
    clearTimeout(checkTimer);
    if (!username) return;
    checkTimer = setTimeout(async () => {
      checking.value = true;
      try {
        const { data } = await api.get('/auth/check', { params: { username } });
        accountHint.value = data.data.exists ? `帳號已建立：${data.data.displayName}` : '資料庫裡沒有這個帳號';
      } catch {
        accountHint.value = '';
      } finally {
        checking.value = false;
      }
    }, 400);
  }
);

async function login() {
  try {
    await auth.login(form);
    router.push('/admin/dashboard');
  } catch (e) {
    error.value = e.response?.data?.message
      || (e.code === 'ERR_NETWORK' ? '無法連線到後端，請確認 MySQL 與後端服務已啟動' : '登入失敗');
  }
}
</script>
<template><section style="max-width:480px;margin:auto"><h1>管理員登入</h1><form class="card form-grid" @submit.prevent="login"><div class="field full"><label>帳號</label><input v-model="form.username" required><small class="muted">{{ checking ? '檢查帳號中…' : accountHint }}</small></div><div class="field full"><label>密碼</label><input v-model="form.password" type="password" required></div><button class="btn btn-primary field full">登入</button><p class="error field full">{{error}}</p></form></section></template>
