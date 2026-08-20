<script setup>
import { computed } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const props = defineProps({
  items: { type: Array, default: () => [] },
  type: { type: String, default: 'bar' },
  horizontal: { type: Boolean, default: false }
});
const colors = ['#ff6b6b', '#f7b32b', '#19b88a', '#3d8beb', '#8b6de8', '#e6539a', '#5d7892'];
const chartData = computed(() => ({ labels: props.items.map(x => x.label), datasets: [{ data: props.items.map(x => x.value), backgroundColor: colors, borderRadius: 8, borderWidth: 0 }] }));
const options = computed(() => {
  const isHorizontal = props.type === 'bar' && props.horizontal;
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: isHorizontal
      ? {
          x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(229,231,235,0.8)' } },
          y: { grid: { display: false }, ticks: { color: '#374151' } }
        }
      : {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(229,231,235,0.8)' } },
          x: { grid: { display: false }, ticks: { color: '#374151' } }
        }
  };
});
</script>
<template>
  <div class="chart-wrap">
    <Doughnut v-if="type === 'doughnut'" :data="chartData" :options="{ ...options, scales: {} }" />
    <Bar v-else :data="chartData" :options="options" />
  </div>
</template>
