<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { t } from '../i18n';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const props = defineProps({
  latitude: [Number, String], longitude: [Number, String], editable: Boolean,
  height: { type: String, default: '300px' }
});
const emit = defineEmits(['update:location']);
const route = useRoute();
const mapLabel = computed(() => route.path.startsWith('/admin') ? '案件位置地圖' : t('reportForm.mapLabel'));
const mapEl = ref(null); let map; let marker;
const fallback = [24.1797, 120.6476];
function position() { const lat = Number(props.latitude); const lng = Number(props.longitude); return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : fallback; }
function render() { const point = position(); if (!map) return; map.setView(point, props.latitude && props.longitude ? 17 : 16); if (marker) marker.setLatLng(point); else marker = L.marker(point).addTo(map); }
onMounted(() => { map = L.map(mapEl.value).setView(position(), 16); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map); render(); if (props.editable) map.on('click', e => emit('update:location', { latitude: e.latlng.lat.toFixed(7), longitude: e.latlng.lng.toFixed(7) })); });
watch(() => [props.latitude, props.longitude], render);
onBeforeUnmount(() => map?.remove());
</script>
<template><div ref="mapEl" class="report-map" :style="{height}" :aria-label="mapLabel"></div></template>
