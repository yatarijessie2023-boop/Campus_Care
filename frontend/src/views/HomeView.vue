<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge.vue';
import { formatReportNo } from '../utils/reportNumber';
import { locale, localizeData, localizeMessage, t } from '../i18n';

const reportNo = ref('');
const trackedReport = ref(null);
const trackingError = ref('');
const tracking = ref(false);
const route = useRoute();
const showQuickTrack = ref(route.query.track === '1');

watch(() => route.query.track, async (value) => {
  showQuickTrack.value = value === '1';
  if (value === '1') {
    await nextTick();
    document.getElementById('quick-track-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

async function trackReport() {
  const value = reportNo.value.trim().toUpperCase();
  trackedReport.value = null;
  trackingError.value = '';

  if (!value) {
    trackingError.value = t('home.errors.emptyReportNo');
    return;
  }

  tracking.value = true;
  try {
    const response = await api.get(`/reports/track/${encodeURIComponent(value)}`);
    trackedReport.value = response.data.data;
    reportNo.value = value;
  } catch (e) {
    trackingError.value = localizeMessage(e.response?.data?.message || t('home.errors.trackFailed'));
  } finally {
    tracking.value = false;
  }
}

function date(value) {
  return value ? new Date(value).toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-TW', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}
</script>

<template>
  <div class="home-page">
  <section class="hero">
    <p>{{ $t('home.eyebrow') }}</p>
    <h1>{{ $t('home.title') }}</h1>
    <p class="hero-description">{{ $t('home.description') }}</p>
    <div class="actions">
      <router-link class="btn btn-primary" to="/report">{{ $t('home.reportNow') }}</router-link>
    </div>

    <div v-if="showQuickTrack" id="quick-track-panel" class="quick-track-panel">
      <form class="quick-track-form" @submit.prevent="trackReport">
        <label for="quick-track-report-no">{{ $t('home.trackLabel') }}</label>
        <div class="track-input-row">
          <input id="quick-track-report-no" v-model="reportNo" type="text" :placeholder="$t('home.trackPlaceholder')" autocomplete="off" />
          <button class="btn btn-primary" type="submit" :disabled="tracking">
            {{ tracking ? $t('home.loading') : $t('home.track') }}
          </button>
        </div>
        <p v-if="trackingError" class="error track-message">{{ trackingError }}</p>
      </form>
      <div v-if="trackedReport" class="quick-track-result">
        <div>
          <small>{{ $t('home.reportNo') }}</small>
          <strong>{{ formatReportNo(trackedReport.report_no) }}</strong>
        </div>
        <StatusBadge :status="trackedReport.status" />
        <p>{{ localizeData(trackedReport.category_name) }} · {{ localizeData(trackedReport.building_name) }}</p>
      </div>
    </div>

    <div class="feature-grid">
      <article class="feature-card feature-card-photo"><h3>📷 {{ $t('home.features.photo') }}</h3><p>{{ $t('home.features.photoText') }}</p></article>
      <article class="feature-card feature-card-map"><h3>📍 {{ $t('home.features.map') }}</h3><p>{{ $t('home.features.mapText') }}</p></article>
      <article class="feature-card feature-card-search"><h3>🔍 {{ $t('home.features.search') }}</h3><p>{{ $t('home.features.searchText') }}</p></article>
    </div>
  </section>

  </div>
</template>
