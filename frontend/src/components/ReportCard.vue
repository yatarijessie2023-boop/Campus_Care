<script setup>
import { ref } from 'vue';
import StatusBadge from './StatusBadge.vue';
import { formatReportNo } from '../utils/reportNumber';
import { locale, localizeData, t } from '../i18n';

const props = defineProps({
  report: { type: Object, required: true },
});
const copyState = ref('');

async function copyReportNo() {
  const reportNo = formatReportNo(props.report.report_no);
  try {
    await navigator.clipboard.writeText(reportNo);
    copyState.value = t('report.copied');
  } catch {
    copyState.value = t('report.copyFailed');
  }
  window.setTimeout(() => { copyState.value = ''; }, 1800);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-TW', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}
</script>

<template>
  <div class="card report-row">
    <div class="report-row-identity">
      <router-link :to="`/reports/${report.report_no}`" class="report-row-link">
        <strong>{{ formatReportNo(report.report_no) }}<br>{{ localizeData(report.building_name) }}</strong>
      </router-link>
      <button class="copy-report-button" type="button" :aria-label="`${t('report.copy')} ${formatReportNo(report.report_no)}`" :title="copyState || t('report.copy')" @click="copyReportNo">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></svg>
      </button>
      <small v-if="copyState" class="copy-report-state" role="status">{{ copyState }}</small>
    </div>
    <span>{{ localizeData(report.category_name) }}<br>{{ localizeData(report.location_detail) }}</span>
    <span>{{ formatDate(report.created_at) }}</span>
    <StatusBadge :status="report.status" />
  </div>
</template>
