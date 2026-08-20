import { createRouter, createWebHistory } from 'vue-router';
const HomeView = () => import('../views/HomeView.vue');
const ReportFormView = () => import('../views/ReportFormView.vue');
const ReportsView = () => import('../views/ReportsView.vue');
const LoginView = () => import('../views/LoginView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const ReportDetailView = () => import('../views/ReportDetailView.vue');
const AdminReportEditView = () => import('../views/AdminReportEditView.vue');
const AdminDataView = () => import('../views/AdminDataView.vue');
const AdminAccountsView = () => import('../views/AdminAccountsView.vue');
const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', component: HomeView }, { path: '/report', component: ReportFormView },
  { path: '/reports', component: ReportsView }, { path: '/admin/login', component: LoginView },
  { path: '/admin/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/reports/:id', component: ReportDetailView },
  { path: '/admin/reports/:id/edit', component: AdminReportEditView, meta: { requiresAuth: true } },
  { path: '/admin/data', component: AdminDataView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/accounts', component: AdminAccountsView, meta: { requiresAuth: true, requiresAdmin: true } }
]});
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('admin_token')) return '/admin/login';
  if (to.meta.requiresAdmin) {
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || 'null');
      if (user?.role !== 'admin') return '/admin/dashboard';
    } catch {
      return '/admin/dashboard';
    }
  }
  return true;
});
export default router;
