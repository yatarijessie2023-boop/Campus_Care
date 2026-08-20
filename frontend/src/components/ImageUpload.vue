<script setup>
import { computed } from 'vue';
import { t } from '../i18n';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: { type: [FileList, Array], default: () => [] },
});

const selectedCount = computed(() => props.modelValue?.length || 0);
const selectedLabel = computed(() => selectedCount.value ? t('upload.selected', { count: selectedCount.value }) : t('upload.none'));

function handleChange(event) {
  emit('update:modelValue', event.target.files);
}
</script>

<template>
  <div class="upload-card">
    <div class="upload-card-head">
      <div>
        <label>{{ $t('upload.title') }}</label>
        <p class="muted upload-card-desc">{{ $t('upload.description') }}</p>
      </div>
      <div class="upload-card-tags">
        <span>{{ $t('upload.max') }}</span>
        <span>{{ $t('upload.size') }}</span>
        <span>JPG / PNG / WEBP</span>
      </div>
    </div>
    <div class="upload-file-picker">
      <label class="btn btn-light" for="report-images">{{ $t('upload.choose') }}</label>
      <span class="muted">{{ selectedLabel }}</span>
    </div>
    <input id="report-images" class="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" @change="handleChange">
    <small class="muted">{{ $t('upload.hint') }}</small>
  </div>
</template>
