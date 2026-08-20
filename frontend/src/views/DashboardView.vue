<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
const StatsChart = defineAsyncComponent(() => import('../components/StatsChart.vue'));
import StatusBadge from '../components/StatusBadge.vue';
import { formatReportNo } from '../utils/reportNumber';

const auth = useAuthStore();
const router = useRouter();
const data = ref({ summary: {}, byCategory: [], byBuilding: [] });
const reports = ref([]);
const error = ref('');
const success = ref('');
const archivingReportId = ref(null);
const reportKeyword = ref('');
const reportSort = ref('status');
const showArchived = ref(false);
const statusOrder = { pending: 0, processing: 1, rejected: 2, completed: 3 };

async function onArchivedToggle() {
  try {
    const { data: response } = await api.get('/reports', { params: { limit: 8, includeArchived: showArchived.value ? 1 : 0 } });
    reports.value = response.data;
  } catch (e) {
    error.value = e.response?.data?.message || '案件資料載入失敗';
  }
}

onMounted(async () => {
  try {
    const [dashboard, list] = await Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports', { params: { limit: 8, includeArchived: showArchived.value ? 1 : 0 } })
    ]);
    data.value = dashboard.data.data;
    reports.value = list.data.data;
  } catch (e) {
    error.value = e.response?.data?.message || '資料載入失敗';
  }
});

const categoryTotal = computed(() => data.value.byCategory.reduce((sum, item) => sum + Number(item.value || 0), 0));
const buildingTotal = computed(() => data.value.byBuilding.reduce((sum, item) => sum + Number(item.value || 0), 0));
const visibleReports = computed(() => {
  const keyword = reportKeyword.value.trim().toLowerCase();
  const result = reports.value.filter((report) => {
    if (!keyword) return true;
    return [report.report_no, report.building_name, report.category_name, report.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  return [...result].sort((a, b) => {
    if (reportSort.value === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (reportSort.value === 'number') return String(a.report_no).localeCompare(String(b.report_no));
    if (reportSort.value === 'status') {
      return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
});

function formatShare(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function reportLink(status = '') {
  return status ? { path: '/reports', query: { status } } : { path: '/reports' };
}

function formatAverageProcessingTime(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 24) return `${value.toFixed(value < 10 ? 1 : 0)} 小時`;
  const days = value / 24;
  return `${days.toFixed(days < 10 ? 1 : 0)} 天`;
}

function logout() {
  auth.logout();
  router.push('/');
}

async function archiveReport(report) {
  const action = report.archived_at ? '解除封存' : '封存';
  const confirmation = report.archived_at
    ? `確定要解除封存案件 ${formatReportNo(report.report_no)} 嗎？`
    : `確定要封存案件 ${formatReportNo(report.report_no)} 嗎？案件資料會保留，但會從一般列表隱藏。`;
  if (!window.confirm(confirmation)) return;

  error.value = '';
  success.value = '';
  archivingReportId.value = report.id;
  try {
    const endpoint = report.archived_at ? 'restore' : 'archive';
    const { data: response } = await api.patch(`/reports/${report.id}/${endpoint}`, report.archived_at ? {} : { reason: '管理員於最新案件列表封存' });
    if (!showArchived.value) reports.value = reports.value.filter((item) => item.id !== report.id);
    else report.archived_at = report.archived_at ? null : new Date().toISOString();
    success.value = response.message || `案件已${action}`;
  } catch (e) {
    error.value = e.response?.data?.message || `案件${action}失敗`;
  } finally {
    archivingReportId.value = null;
  }
}
</script>
<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">FCU Care</p>
        <h1>管理 Dashboard</h1>
      </div>
      <div class="admin-heading-actions">
        <span class="muted">即時案件概況</span>
        <router-link v-if="auth.user?.role === 'admin'" class="btn btn-light" to="/admin/data">資料管理</router-link>
        <router-link v-if="auth.user?.role === 'admin'" class="btn btn-light" to="/admin/accounts">帳號管理</router-link>
        <button class="btn btn-light" type="button" @click="logout">登出</button>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success" role="status">{{ success }}</p>

    <div class="grid metric-grid">
      <router-link class="card metric metric-link" :to="reportLink()">
        <small>今日通報</small>
        <h2>{{ data.summary.today || 0 }}</h2>
        <span class="metric-hint">查看全部案件</span>
      </router-link>
      <router-link class="card metric metric-link metric-pending" :to="reportLink('pending')">
        <small>待處理</small>
        <h2>{{ data.summary.pending || 0 }}</h2>
        <span class="metric-hint">點擊看待處理清單</span>
      </router-link>
      <router-link class="card metric metric-link" :to="reportLink('processing')">
        <small>處理中</small>
        <h2>{{ data.summary.processing || 0 }}</h2>
        <span class="metric-hint">點擊看處理中清單</span>
      </router-link>
      <router-link class="card metric metric-link" :to="reportLink('completed')">
        <small>已完成</small>
        <h2>{{ data.summary.completed || 0 }}</h2>
        <span class="metric-hint">點擊看已完成清單</span>
      </router-link>
      <article class="card metric">
        <small>平均處理時間</small>
        <h2 class="metric-time">{{ formatAverageProcessingTime(data.summary.average_processing_hours) }}</h2>
        <span class="metric-hint">依已完成案件計算</span>
      </article>
    </div>

    <div class="dashboard-main-grid section">
      <div class="dashboard-insights">
        <article class="card insight-card">
        <div class="section-title">
          <div>
            <h2>問題分類</h2>
            <p class="muted">看出哪一類問題最常發生</p>
          </div>
        </div>
        <div class="insight-body">
          <StatsChart class="insight-chart" :items="data.byCategory" type="doughnut" />
          <div class="breakdown-list">
            <div v-for="item in data.byCategory" :key="item.label" class="breakdown-item">
              <div>
                <strong>{{ item.label }}</strong>
                <small>{{ formatShare(item.value, categoryTotal) }}</small>
              </div>
              <span>{{ item.value }}</span>
            </div>
          </div>
        </div>
        </article>

        <article class="card insight-card">
        <div class="section-title">
          <div>
            <h2>地點案件分布</h2>
            <p class="muted">看出問題集中在哪些建物</p>
          </div>
        </div>
        <div class="insight-body">
          <StatsChart class="insight-chart" :items="data.byBuilding" type="doughnut" />
          <div class="breakdown-list">
            <div v-for="item in data.byBuilding" :key="item.label" class="breakdown-item">
              <div>
                <strong>{{ item.label }}</strong>
                <small>{{ formatShare(item.value, buildingTotal) }}</small>
              </div>
              <span>{{ item.value }}</span>
            </div>
          </div>
        </div>
        </article>
      </div>

      <article class="card latest-reports-card">
      <div class="section-title">
        <h2>最新案件</h2>
        <router-link to="/reports">查看全部</router-link>
      </div>
      <div class="report-tools">
        <label class="search-field">
          <span class="sr-only">搜尋案件</span>
          <input v-model="reportKeyword" type="search" placeholder="搜尋案件編號、建物或問題分類" />
        </label>
        <label class="sort-field">
          <span>排序</span>
          <select v-model="reportSort" aria-label="案件排序方式">
            <option value="newest">最新建立</option>
            <option value="oldest">最早建立</option>
            <option value="number">案件編號</option>
            <option value="status">處理狀態</option>
          </select>
        </label>
        <label v-if="auth.user?.role === 'admin'" class="archive-toggle">
          <input v-model="showArchived" type="checkbox" @change="onArchivedToggle">
          <span>顯示已封存</span>
        </label>
      </div>
      <div class="admin-list">
        <div v-for="r in visibleReports" :key="r.id" class="admin-row">
          <div>
            <strong>{{ formatReportNo(r.report_no) }}</strong>
            <span>{{ r.building_name }} · {{ r.category_name }}</span>
          </div>
          <StatusBadge :status="r.status" />
          <div class="admin-row-actions">
            <router-link class="btn btn-light btn-small" :to="`/admin/reports/${r.id}/edit`">編輯</router-link>
            <span v-if="r.archived_at" class="status status-archived">已封存</span>
            <button
              v-if="auth.user?.role === 'admin'"
              class="btn btn-danger btn-small"
              type="button"
              :disabled="archivingReportId === r.id"
              :aria-label="`${r.archived_at ? '解除封存' : '封存'}案件 ${formatReportNo(r.report_no)}`"
              @click="archiveReport(r)"
            >
              {{ archivingReportId === r.id ? '處理中…' : (r.archived_at ? '解除封存' : '封存') }}
            </button>
          </div>
        </div>
        <p v-if="!visibleReports.length" class="muted empty-search">找不到符合條件的案件。</p>
      </div>
      </article>
    </div>
  </section>
</template>
