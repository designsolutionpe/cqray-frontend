<script setup>

import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import { getSedes } from '@/service/mantenimiento/SedeService';
import FONO_BOT from '@/assets/PERSONA BOT.png'

const { isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

const aSedes = ref([])

function setChartData_Sedes() {
  const documentStyle = getComputedStyle(document.documentElement);
  const labels = aSedes.value.map(e => e.nombre.split(' ')[1])

  return {
    labels, // Meses
    datasets: [
      {
        type: 'line',
        label: 'Paq. Completo',
        borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        data: [0, 12, 38, 30, 45], // Datos de ingresos,
        tension: 0.3
      },
      {
        type: 'line',
        label: 'Paq. Incompleto',
        borderColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        data: [12, 4, 20, 15, 85], // Datos de ingresos,
        tension: 0.3
      },
      {
        type: 'line',
        label: 'Paq. Mantenimiento',
        borderColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        data: [18, 30, 25, 40, 25], // Datos de ingresos,
        tension: 0.3
      },
      {
        type: 'line',
        label: 'Paq. por Sesiones',
        borderColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        data: [10, 25, 47, 45, 44], // Datos de ingresos,
        tension: 0.3
      },
    ]
  };
}

function setChartOptions() {
  const documentStyle = getComputedStyle(document.documentElement);
  const borderColor = documentStyle.getPropertyValue('--surface-border');
  const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

  return {};
}

const cargarSedes = async () => {
  try {
    aSedes.value = await getSedes();
  } catch (error) {
    console.error('Error al obtener las sedes:', error);
  }
};

watch([isDarkTheme, aSedes], () => {
  chartData.value = setChartData_Sedes()
  chartOptions.value = setChartOptions()
})

onMounted(() => {
  cargarSedes()
  chartData.value = setChartData_Sedes()
  chartOptions.value = setChartOptions()
})

</script>
<template>
  <div class="card grid grid-cols-12 gap-2">
    <div class="col-span-12 md:col-span-8">
      <div class="card crm-whatsapp col-span-12 flex flex-col gap-5 md:col-span-8 md:flex-row">
        <div>
          <h1 class="text-white">CRM Whatsapp</h1>
          <p class="font-1 text-white">Sistema integrador que responde mensajes de clientes por Whatsapp desde 1 solo
            lugar y mejora
            tus
            procesos.</p>
          <Button label="Ingresar" icon="pi pi-fw pi-arrow-circle-right"
            class="bg-primary text-white w-full p-3"></Button>
        </div>
        <img :src="FONO_BOT" alt="Persona usando un telefono">
      </div>
      <div class="card">
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
      </div>
    </div>
    <div class="card col-span-12 md:col-span-4">
      <h2 class="text-primary">Seleccione una sede:</h2>
    </div>
  </div>
</template>
<style scoped>
.crm-whatsapp {
  background: #EA533C;
  border: 1px solid #2D2E93;
}
</style>