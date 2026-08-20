<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import ReportCard from '../components/ReportCard.vue';
import { localizeData } from '../i18n';

const route = useRoute();
const reports = ref([]);
const meta = ref({ buildings: [], categories:[] });
const q = reactive({ keyword:'', status:'', buildingId:'', categoryId:'', page:1, limit:10 });
const pagination = ref({ total:0 });

function applyQuery(query = {}) {
  q.keyword = query.keyword?.toString() || '';
  q.status = query.status?.toString() || '';
  q.buildingId = query.buildingId?.toString() || '';
  q.categoryId = query.categoryId?.toString() || '';
  q.page = Number(query.page || 1);
  q.limit = Number(query.limit || 10);
}

async function load(){const {data}=await api.get('/reports',{params:q});reports.value=data.data;pagination.value=data.pagination;}

watch(() => route.query, async (query) => {
  applyQuery(query);
  const [reportsRes, metaRes] = await Promise.allSettled([api.get('/reports',{params:q}), api.get('/meta')]);
  if (reportsRes.status === 'fulfilled') { reports.value=reportsRes.value.data.data; pagination.value=reportsRes.value.data.pagination; }
  if (metaRes.status === 'fulfilled') meta.value=metaRes.value.data.data;
}, { immediate: true });

const buildingGroups = computed(() => [{
  area: '主校區',
  items: meta.value.buildings.filter((building) => building.area === '主校區'),
}, {
  area: '福星校區',
  items: meta.value.buildings.filter((building) => building.area === '福星校區'),
}, {
  area: '其他地點',
  items: meta.value.buildings.filter((building) => building.area === '其他地點'),
}].filter((group) => group.items.length));
</script>
<template>
  <section>
    <h1>{{ $t('board.title') }}</h1>
    <div class="card form-grid">
      <div class="field">
        <label>{{ $t('board.keyword') }}</label>
        <input v-model="q.keyword" :placeholder="$t('board.keywordPlaceholder')">
      </div>
      <div class="field">
        <label>{{ $t('board.location') }}</label>
        <select v-model="q.buildingId">
          <option value="">{{ $t('board.all') }}</option>
          <optgroup v-for="group in buildingGroups" :key="group.area" :label="localizeData(group.area)">
            <option v-for="b in group.items" :key="b.id" :value="b.id">{{ localizeData(b.name) }}</option>
          </optgroup>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('board.category') }}</label>
        <select v-model="q.categoryId">
          <option value="">{{ $t('board.all') }}</option>
          <option v-for="c in meta.categories" :key="c.id" :value="c.id">{{ localizeData(c.name) }}</option>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('board.status') }}</label>
        <select v-model="q.status">
          <option value="">{{ $t('board.all') }}</option>
          <option value="pending">{{ $t('status.pending') }}</option>
          <option value="processing">{{ $t('status.processing') }}</option>
          <option value="completed">{{ $t('status.completed') }}</option>
          <option value="rejected">{{ $t('status.rejected') }}</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="q.page=1;load()">{{ $t('board.search') }}</button>
    </div>
    <div class="section list">
      <ReportCard v-for="r in reports" :key="r.id" :report="r" />
      <p v-if="!reports.length">{{ $t('board.none') }}</p>
    </div>
    <p>{{ $t('board.total', { count: pagination.total || 0 }) }}</p>
  </section>
</template>
