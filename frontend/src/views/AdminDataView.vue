<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../services/api';

const buildings = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const buildingForm = reactive({ code: '', name: '', latitude: '', longitude: '' });
const categoryForm = reactive({ name: '', type: 'repair', sort_order: 0 });

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/admin/meta');
    buildings.value = data.data.buildings;
    categories.value = data.data.categories;
  } catch (e) {
    error.value = e.response?.data?.message || '資料載入失敗';
  } finally {
    loading.value = false;
  }
}

async function addBuilding() {
  error.value = ''; success.value = '';
  try {
    const { data } = await api.post('/admin/meta/buildings', buildingForm);
    success.value = data.message;
    Object.assign(buildingForm, { code: '', name: '', latitude: '', longitude: '' });
    await loadData();
  } catch (e) { error.value = e.response?.data?.message || '新增建築失敗'; }
}

async function saveBuilding(item) {
  error.value = ''; success.value = '';
  try {
    const { data } = await api.patch(`/admin/meta/buildings/${item.id}`, item);
    success.value = data.message;
    await loadData();
  } catch (e) { error.value = e.response?.data?.message || '更新建築失敗'; }
}

async function addCategory() {
  error.value = ''; success.value = '';
  try {
    const { data } = await api.post('/admin/meta/categories', categoryForm);
    success.value = data.message;
    Object.assign(categoryForm, { name: '', type: 'repair', sort_order: 0 });
    await loadData();
  } catch (e) { error.value = e.response?.data?.message || '新增分類失敗'; }
}

async function saveCategory(item) {
  error.value = ''; success.value = '';
  try {
    const { data } = await api.patch(`/admin/meta/categories/${item.id}`, item);
    success.value = data.message;
    await loadData();
  } catch (e) { error.value = e.response?.data?.message || '更新分類失敗'; }
}

onMounted(loadData);
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">管理後台</p>
        <h1>建築與分類管理</h1>
      </div>
      <router-link class="btn btn-light" to="/admin/dashboard">返回 Dashboard</router-link>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="loading" class="muted">資料載入中…</p>

    <div class="admin-data-grid">
      <article class="card">
        <div class="section-title">
          <div>
            <h2>建築管理</h2>
            <p class="muted">管理通報表單可選擇的校園建築</p>
          </div>
        </div>
        <form class="admin-add-form" @submit.prevent="addBuilding">
          <input v-model="buildingForm.name" placeholder="建築名稱" required />
          <input v-model="buildingForm.code" placeholder="代碼（可留空）" />
          <input v-model="buildingForm.latitude" type="number" step="any" placeholder="緯度（可留空）" />
          <input v-model="buildingForm.longitude" type="number" step="any" placeholder="經度（可留空）" />
          <button class="btn btn-primary" type="submit">新增建築</button>
        </form>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>名稱</th><th>代碼</th><th>狀態</th><th></th></tr></thead>
            <tbody>
              <tr v-for="item in buildings" :key="item.id">
                <td><input v-model="item.name" /></td>
                <td><input v-model="item.code" /></td>
                <td><label class="toggle-label"><input v-model="item.is_active" type="checkbox" :true-value="1" :false-value="0" /> 啟用</label></td>
                <td><button class="btn btn-light btn-small" @click="saveBuilding(item)">儲存</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <div class="section-title">
          <div>
            <h2>分類管理</h2>
            <p class="muted">管理修繕、清潔等通報分類</p>
          </div>
        </div>
        <form class="admin-add-form category-add-form" @submit.prevent="addCategory">
          <input v-model="categoryForm.name" placeholder="分類名稱" required />
          <select v-model="categoryForm.type">
            <option value="repair">修繕</option>
            <option value="cleaning">清潔</option>
          </select>
          <input v-model.number="categoryForm.sort_order" type="number" min="0" placeholder="排序" />
          <button class="btn btn-primary" type="submit">新增分類</button>
        </form>

        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>名稱</th><th>類型</th><th>排序</th><th>狀態</th><th></th></tr></thead>
            <tbody>
              <tr v-for="item in categories" :key="item.id">
                <td><input v-model="item.name" /></td>
                <td><select v-model="item.type"><option value="repair">修繕</option><option value="cleaning">清潔</option></select></td>
                <td><input v-model.number="item.sort_order" type="number" min="0" /></td>
                <td><label class="toggle-label"><input v-model="item.is_active" type="checkbox" :true-value="1" :false-value="0" /> 啟用</label></td>
                <td><button class="btn btn-light btn-small" @click="saveCategory(item)">儲存</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>
