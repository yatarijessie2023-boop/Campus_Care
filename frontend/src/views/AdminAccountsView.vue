<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const accounts = ref([]);
const loading = ref(false);
const message = ref('');
const error = ref('');
const newAccount = reactive({ username: '', displayName: '', password: '', role: 'staff' });
const passwordDrafts = reactive({});

const currentUserId = computed(() => Number(auth.user?.id));

async function loadAccounts() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/admin/accounts');
    accounts.value = data.data.map((item) => ({ ...item, role: item.role || 'staff' }));
  } catch (e) {
    error.value = e.response?.data?.message || '帳號資料載入失敗';
  } finally {
    loading.value = false;
  }
}

async function addAccount() {
  message.value = ''; error.value = '';
  try {
    const { data } = await api.post('/admin/accounts', newAccount);
    message.value = data.message;
    Object.assign(newAccount, { username: '', displayName: '', password: '', role: 'staff' });
    await loadAccounts();
  } catch (e) {
    error.value = e.response?.data?.message || '新增帳號失敗';
  }
}

async function saveAccount(item) {
  message.value = ''; error.value = '';
  try {
    const { data } = await api.patch(`/admin/accounts/${item.id}`, {
      displayName: item.display_name,
      role: item.role,
      isActive: item.is_active
    });
    message.value = data.message;
    if (Number(item.id) === currentUserId.value) {
      const updatedUser = { ...auth.user, displayName: item.display_name, role: item.role };
      auth.user = updatedUser;
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    }
    await loadAccounts();
  } catch (e) {
    error.value = e.response?.data?.message || '更新帳號失敗';
    await loadAccounts();
  }
}

async function resetPassword(item) {
  message.value = ''; error.value = '';
  const password = passwordDrafts[item.id] || '';
  try {
    const { data } = await api.patch(`/admin/accounts/${item.id}/password`, { password });
    message.value = `${item.username}：${data.message}`;
    passwordDrafts[item.id] = '';
  } catch (e) {
    error.value = e.response?.data?.message || '重設密碼失敗';
  }
}

onMounted(loadAccounts);
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">管理後台</p>
        <h1>帳號與密碼管理</h1>
        <p class="muted">建立後台使用者、設定權限、停用帳號或重設密碼。</p>
      </div>
      <router-link class="btn btn-light" to="/admin/dashboard">返回 Dashboard</router-link>
    </div>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <article class="card section">
      <div class="section-title">
        <div><h2>新增後台帳號</h2><p class="muted">密碼至少 8 個字元。</p></div>
      </div>
      <form class="admin-account-create" @submit.prevent="addAccount">
        <div class="field"><label>帳號 *</label><input v-model.trim="newAccount.username" required placeholder="例如：facility01"></div>
        <div class="field"><label>姓名 *</label><input v-model.trim="newAccount.displayName" required placeholder="管理人員姓名"></div>
        <div class="field"><label>初始密碼 *</label><input v-model="newAccount.password" type="password" minlength="8" required placeholder="至少 8 個字元"></div>
        <div class="field"><label>角色 *</label><select v-model="newAccount.role"><option value="staff">一般人員</option><option value="admin">系統管理員</option></select></div>
        <button class="btn btn-primary" type="submit">新增帳號</button>
      </form>
    </article>

    <article class="card section">
      <div class="section-title"><h2>現有帳號</h2><span class="muted">{{ accounts.length }} 個</span></div>
      <p v-if="loading" class="muted">載入中…</p>
      <div v-else class="account-list">
        <div v-for="item in accounts" :key="item.id" class="account-card">
          <div class="account-card-head">
            <div><strong>{{ item.username }}</strong><small v-if="Number(item.id) === currentUserId">目前登入</small></div>
            <label class="account-active"><input v-model="item.is_active" type="checkbox" :disabled="Number(item.id) === currentUserId"> 啟用</label>
          </div>
          <div class="account-edit-grid">
            <div class="field"><label>姓名</label><input v-model="item.display_name"></div>
            <div class="field"><label>角色</label><select v-model="item.role" :disabled="Number(item.id) === currentUserId"><option value="staff">一般人員</option><option value="admin">系統管理員</option></select></div>
            <button class="btn btn-light account-save" type="button" @click="saveAccount(item)">儲存資料</button>
          </div>
          <div class="password-reset-row">
            <div class="field"><label>重設密碼</label><input v-model="passwordDrafts[item.id]" type="password" minlength="8" placeholder="輸入新密碼（至少 8 碼）"></div>
            <button class="btn btn-light" type="button" :disabled="!(passwordDrafts[item.id] || '').length" @click="resetPassword(item)">更新密碼</button>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
