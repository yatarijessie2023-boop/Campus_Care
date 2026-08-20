<script setup>
import { computed, onMounted, reactive, ref } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import api from '../services/api'; import ReportMap from '../components/ReportMap.vue'; import { resolveUploadUrl } from '../utils/url';
import { formatReportNo } from '../utils/reportNumber';
const route = useRoute(); const router = useRouter(); const report = ref(null); const saving = ref(false); const message = ref(''); const form = reactive({ status:'', adminReply:'' });
const selectedImage = ref(''); const modalImage = ref('');
const statusText = { pending:'待處理', processing:'處理中', completed:'已完成', rejected:'已退件' };
const images = computed(() => report.value?.images || []);
onMounted(async () => { try { report.value = (await api.get(`/reports/${route.params.id}`)).data.data; form.status=report.value.status; form.adminReply=report.value.admin_reply || ''; selectedImage.value = report.value.images?.[0]?.image_url || ''; } catch (e) { message.value=e.response?.data?.message || '無法載入案件'; } });
async function save() { saving.value=true; message.value=''; try { const { data } = await api.patch(`/reports/${route.params.id}`, form); message.value=data.message || '案件已更新'; report.value=(await api.get(`/reports/${route.params.id}`)).data.data; } catch(e) { message.value=e.response?.data?.message || '更新失敗'; } finally { saving.value=false; } }
function selectImage(url) { selectedImage.value = url; }
function openImage(url) { modalImage.value = url; }
function downloadImage(url) {
  const link = document.createElement('a');
  link.href = resolveUploadUrl(url);
  link.download = url.split('/').pop() || 'report-image';
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.click();
}
</script>
<template>
  <section v-if="report">
    <div class="page-heading">
      <div>
        <p class="eyebrow">管理後台／案件編輯</p>
        <h1>{{ formatReportNo(report.report_no) }}</h1>
      </div>
      <router-link class="btn btn-light" :to="`/reports/${report.id}`">查看公開詳情</router-link>
    </div>

    <div class="detail-layout">
      <article class="card">
        <h2>{{ report.category_name }} · {{ report.building_name }}</h2>
        <p class="muted">{{ report.floor || '未填樓層' }} · {{ report.location_detail }}</p>
        <p class="detail-description">{{ report.description }}</p>

        <section class="reporter-info">
          <div class="section-title">
            <h3>通報人資料</h3>
            <small class="muted">案件聯絡資訊</small>
          </div>
          <dl class="reporter-info-grid">
            <div>
              <dt>姓名</dt>
              <dd>{{ report.reporter_name || '未提供' }}</dd>
            </div>
            <div>
              <dt>學號／員工編號</dt>
              <dd>{{ report.reporter_identifier || '未提供' }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a v-if="report.reporter_email" :href="`mailto:${report.reporter_email}`">{{ report.reporter_email }}</a>
                <span v-else>未提供</span>
              </dd>
            </div>
          </dl>
        </section>

        <section v-if="images.length" class="admin-photo-panel">
          <div class="section-title">
            <h3>現場照片</h3>
            <small class="muted">{{ images.length }} 張照片，點擊可放大</small>
          </div>
          <div class="admin-photo-layout">
            <button type="button" class="admin-photo-main" @click="openImage(selectedImage || images[0]?.image_url)">
              <img :src="resolveUploadUrl(selectedImage || images[0]?.image_url)" alt="案件現場照片" width="640" height="360">
            </button>
            <div class="admin-photo-list">
              <button
                v-for="image in images"
                :key="image.id"
                type="button"
                class="admin-photo-thumb"
                :class="{ active: (selectedImage || images[0]?.image_url) === image.image_url }"
                @click="selectImage(image.image_url)"
              >
                <img :src="resolveUploadUrl(image.image_url)" alt="案件縮圖" loading="lazy" width="160" height="72">
              </button>
            </div>
            <div class="admin-photo-actions">
              <button
                v-for="image in images"
                :key="`dl-${image.id}`"
                type="button"
                class="btn btn-light btn-small"
                @click="downloadImage(image.image_url)"
              >
                下載 {{ image.id }}
              </button>
            </div>
          </div>
        </section>

        <ReportMap v-if="report.latitude && report.longitude" :latitude="report.latitude" :longitude="report.longitude" />
      </article>

      <form class="card" @submit.prevent="save">
        <h2>更新處理狀態</h2>
        <div class="field">
          <label>狀態</label>
          <select v-model="form.status">
            <option v-for="(label, key) in statusText" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="field">
          <label>管理員回覆／處理備註</label>
          <textarea v-model="form.adminReply" placeholder="填寫給通報人的說明"></textarea>
        </div>
        <button class="btn btn-primary" :disabled="saving">{{ saving ? '儲存中…' : '儲存變更' }}</button>
        <p :class="message.includes('已') ? 'success' : 'error'">{{ message }}</p>
      </form>
    </div>

    <router-link class="btn btn-light" to="/admin/dashboard">返回 Dashboard</router-link>

    <div v-if="modalImage" class="image-modal" @click.self="modalImage=''">
      <img :src="resolveUploadUrl(modalImage)" alt="放大照片">
      <button class="image-modal-close" type="button" @click="modalImage=''">關閉</button>
    </div>
  </section>
  <p v-else class="error">{{ message || '載入中…' }}</p>
</template>
