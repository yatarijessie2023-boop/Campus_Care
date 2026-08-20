<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import api from '../services/api';
import ReportMap from '../components/ReportMap.vue';
import ImageUpload from '../components/ImageUpload.vue';
import { localizeData, localizeMessage, t } from '../i18n';
const meta = reactive({ buildings: [], categories: [] });
const form = reactive({ reporterIdentifier:'', reporterName:'', reporterEmail:'', buildingId:'', categoryId:'', floor:'', locationDetail:'', locationPreset:'', description:'', latitude:'', longitude:'' });
const images = ref([]); const message = ref(''); const loading = ref(false);
const submittedReportNo = ref(''); const copyState = ref('');
const locationOptions = [
  { value: '教室入口', label: '教室入口' },
  { value: '教室內部', label: '教室內部' },
  { value: '走廊', label: '走廊' },
  { value: '廁所', label: '廁所' },
  { value: '電梯口', label: '電梯口' },
  { value: '樓梯間', label: '樓梯間' },
  { value: '飲水機', label: '飲水機' },
  { value: '用餐區', label: '用餐區' },
  { value: '停車場', label: '停車場' },
  { value: '其他', label: '其他（自行輸入）' }
];
onMounted(async()=>{ const {data}=await api.get('/meta'); Object.assign(meta,data.data); });
function useLocation(){ navigator.geolocation?.getCurrentPosition(p=>{form.latitude=p.coords.latitude.toFixed(7);form.longitude=p.coords.longitude.toFixed(7);},()=>message.value=t('home.errors.locationFailed')); }
async function copyReportNo(){
  if (!submittedReportNo.value) return;
  try {
    await navigator.clipboard.writeText(submittedReportNo.value);
    copyState.value = t('report.copied');
  } catch {
    copyState.value = t('report.copyFailed');
  }
  window.setTimeout(() => { copyState.value = ''; }, 2200);
}
async function submit(){ loading.value=true; message.value=''; submittedReportNo.value=''; copyState.value=''; try{ if (!form.reporterIdentifier.trim()) { message.value = t('home.errors.missingIdentifier'); return; } const fd=new FormData(); const locationDetail = form.locationPreset === '其他' ? [form.locationDetail].filter(Boolean).join('') : [form.locationPreset, form.locationDetail].filter(Boolean).join(' · '); Object.entries({ ...form, locationDetail }).forEach(([k,v])=>fd.append(k,v)); [...images.value].forEach(f=>fd.append('images',f)); const {data}=await api.post('/reports',fd); submittedReportNo.value=data.data.reportNo; message.value=t('reportForm.success'); Object.keys(form).forEach(k=>form[k]=''); images.value=[]; }catch(e){message.value=localizeMessage(e.response?.data?.message || t('home.errors.submitFailed'));}finally{loading.value=false;} }
const categoryGroups = computed(() => {
  const groups = { repair: [], cleaning: [] };
  const other = [];
  meta.categories.forEach((item) => {
    if (item.name === '其他問題' || item.name === '常見問題') {
      other.push(item);
      return;
    }
    if (item.type === 'repair' && item.name !== '修繕') groups.repair.push(item);
    if (item.type === 'cleaning' && item.name !== '清潔') groups.cleaning.push(item);
  });
  return { ...groups, other };
});
const buildingGroups = computed(() => {
  const order = ['主校區', '福星校區', '其他地點'];
  return order.map((area) => ({
    area,
    items: meta.buildings.filter((building) => building.area === area),
  })).filter((group) => group.items.length);
});
</script>
<template>
  <section>
    <h1>{{ $t('reportForm.title') }}</h1>
    <p>{{ $t('reportForm.intro') }}</p>
    <form class="card form-grid" @submit.prevent="submit">
      <div class="field">
        <label>{{ $t('reportForm.identifier') }} *</label>
        <input v-model="form.reporterIdentifier" required :placeholder="$t('reportForm.identifier')">
      </div>
      <div class="field">
        <label>{{ $t('reportForm.name') }} *</label>
        <input v-model="form.reporterName" required :placeholder="$t('reportForm.name')">
      </div>
      <div class="field">
        <label>{{ $t('reportForm.email') }} *</label>
        <input v-model="form.reporterEmail" type="email" required :placeholder="$t('reportForm.emailPlaceholder')">
      </div>
      <div class="field">
        <label>{{ $t('reportForm.location') }} *</label>
        <select v-model="form.buildingId" required>
          <option value="">{{ $t('reportForm.choose') }}</option>
          <optgroup v-for="group in buildingGroups" :key="group.area" :label="localizeData(group.area)">
            <option v-for="b in group.items" :key="b.id" :value="b.id">{{ localizeData(b.name) }}</option>
          </optgroup>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('reportForm.category') }} *</label>
        <select v-model="form.categoryId" required>
          <option value="">{{ $t('reportForm.choose') }}</option>
          <optgroup v-if="categoryGroups.repair.length" :label="localizeData('修繕')">
            <option v-for="c in categoryGroups.repair" :key="c.id" :value="c.id">{{ localizeData(c.name) }}</option>
          </optgroup>
          <optgroup v-if="categoryGroups.cleaning.length" :label="localizeData('清潔')">
            <option v-for="c in categoryGroups.cleaning" :key="c.id" :value="c.id">{{ localizeData(c.name) }}</option>
          </optgroup>
          <optgroup v-if="categoryGroups.other.length" :label="localizeData('其他問題')">
            <option v-for="c in categoryGroups.other" :key="c.id" :value="c.id">{{ localizeData(c.name) }}</option>
          </optgroup>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('reportForm.floor') }}</label>
        <input v-model="form.floor" :placeholder="$t('reportForm.floorPlaceholder')">
      </div>
      <div class="field">
        <label>{{ $t('reportForm.detail') }} *</label>
        <select v-model="form.locationPreset" required>
          <option value="">{{ $t('reportForm.choose') }}</option>
            <option v-for="item in locationOptions" :key="item.value" :value="item.value">{{ localizeData(item.label) }}</option>
        </select>
      </div>
      <div class="field" v-if="form.locationPreset === '其他'">
        <label>{{ $t('reportForm.detailExtra') }} *</label>
        <input v-model="form.locationDetail" required :placeholder="$t('reportForm.detailOtherPlaceholder')">
      </div>
      <div class="field full" v-else>
        <label>{{ $t('reportForm.detailExtra') }}</label>
        <input v-model="form.locationDetail" :placeholder="$t('reportForm.detailExtraPlaceholder')">
      </div>
      <div class="field full">
        <label>{{ $t('reportForm.description') }} *</label>
        <textarea v-model="form.description" required></textarea>
      </div>
      <div class="field full">
        <ImageUpload v-model="images" />
      </div>
      <div class="field full">
        <label>{{ $t('reportForm.mapLocation') }}</label>
        <ReportMap :latitude="form.latitude" :longitude="form.longitude" editable @update:location="Object.assign(form, $event)" />
      </div>
      <div class="field">
        <label>{{ $t('reportForm.latitude') }}</label>
        <input v-model="form.latitude" readonly>
      </div>
      <div class="field">
        <label>{{ $t('reportForm.longitude') }}</label>
        <input v-model="form.longitude" readonly>
      </div>
      <div class="actions field full">
        <button type="button" class="btn btn-light" @click="useLocation">{{ $t('reportForm.currentLocation') }}</button>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? $t('reportForm.submitting') : $t('reportForm.submit') }}</button>
      </div>
      <div v-if="message" class="field full" :class="submittedReportNo ? 'success' : 'error'">
        <p>{{ message }}</p>
        <div v-if="submittedReportNo" class="report-number-result">
          <strong>{{ submittedReportNo }}</strong>
          <button type="button" class="btn btn-light" @click="copyReportNo">{{ $t('reportForm.copy') }}</button>
          <small v-if="copyState">{{ copyState }}</small>
        </div>
      </div>
    </form>
  </section>
</template>
