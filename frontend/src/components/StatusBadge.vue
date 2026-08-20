<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { t } from '../i18n';

const props = defineProps({
  status: { type: String, required: true },
});
const route = useRoute();
const chineseStatus = { pending: '待處理', processing: '處理中', completed: '已完成', rejected: '已退件' };

const label = computed(() => route.path.startsWith('/admin') ? chineseStatus[props.status] || props.status : t(`status.${props.status}`));
</script>

<template>
  <span class="status" :class="`status-${status}`">{{ label }}</span>
</template>
