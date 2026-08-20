<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isAdminPage = computed(() => route.path.startsWith('/admin'));
</script>

<template>
  <header class="topbar">
    <router-link class="brand" to="/" aria-label="FCU Campus Care">
      <img class="brand-logo" src="/campus-care-logo.webp" alt="FCU Campus Care 逢甲校園報報" width="440" height="117">
    </router-link>
    <nav>
      <router-link class="nav-link nav-cta" to="/report">{{ isAdminPage ? '我要通報' : $t('nav.report') }}</router-link>
      <router-link class="nav-link" :to="{ path: '/', query: { track: '1' } }">{{ isAdminPage ? '案件進度查詢' : $t('nav.track') }}</router-link>
      <router-link class="nav-link" to="/reports">{{ isAdminPage ? '通報看板' : $t('nav.board') }}</router-link>
      <router-link class="nav-link" to="/admin/dashboard">{{ isAdminPage ? '管理後台' : $t('nav.admin') }}</router-link>
      <button class="nav-link language-toggle" type="button" @click="$toggleLocale">{{ isAdminPage ? '語言' : $t('nav.switch') }}</button>
    </nav>
  </header>
</template>
