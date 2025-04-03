<script setup>

import FONO_BOT from '@/assets/PERSONA BOT.png';
import Preloader from '@/components/Preloader.vue';
import { useLayout } from '@/layout/composables/layout';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { onMounted, ref, watch } from 'vue';
import LOGO from '/ICORAY.ico';

const { isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);
const chartShow = ref('paquetes')

const documentStyle = getComputedStyle(document.documentElement);
const datasetsData = {
  paquetes: [
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Completo',
      borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Incompleto',
      borderColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Mantenimiento',
      borderColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. por Sesiones',
      borderColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
  ],
  quiropracticos: [
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Completo',
      borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Incompleto',
      borderColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. Mantenimiento',
      borderColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
    {
      type: 'line',
      tension: 0.3,
      borderWidth: 3,
      label: 'Paq. por Sesiones',
      borderColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
      backgroundColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
      data: [null], // Datos de ingresos,
    },
  ]
}

const isLoading = ref(true)
const isStatsLoading = ref(false)

const aSedes = ref([])

function setChartData_Sedes() {
  const labels = aSedes.value.map(e => e.nombre.split(' ')[1])
  const datasets = datasetsData[chartShow.value].map(e => {
    const d = Array(5).fill().map(e => Math.floor(Math.random() * 50))
    e.data = [null, ...d]
    return e
  })

  return {
    labels, // Meses
    datasets
  };
}

function setChartOptions() {
  const documentStyle = getComputedStyle(document.documentElement);
  const borderColor = documentStyle.getPropertyValue('--surface-border');
  const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

  return {
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textMutedColor
        },
        grid: {
          color: 'transparent',
          borderColor: 'transparent'
        }
      },
      y: {
        stacked: false,
        ticks: {
          color: textMutedColor
        },
        grid: {
          color: borderColor,
          borderColor: 'transparent',
          drawTicks: false
        }
      }
    }
  };
}

const cargarSedes = async () => {
  try {
    const sedes = await getSedes();
    const empty = { nombre: '', empty: true }
    aSedes.value = [empty, ...sedes, empty]
    console.log(sedes, aSedes.value)
  } catch (error) {
    console.error('Error al obtener las sedes:', error);
  }
  isLoading.value = false
};

watch([isDarkTheme, aSedes, chartShow], () => {
  console.log('on watch')
  chartData.value = setChartData_Sedes()
  chartOptions.value = setChartOptions()
})

onMounted(() => {
  cargarSedes()
  console.log('on mounted')
  chartData.value = setChartData_Sedes()
  chartOptions.value = setChartOptions()
})

</script>
<template>
  <div class="card grid grid-cols-12 gap-2 relative">
    <Preloader v-if="isLoading" />
    <div class="col-span-12 xl:col-span-7">
      <div
        class="card crm-whatsapp col-span-12 flex flex-col gap-5 sm:grid sm:grid-rows-1 sm:grid-cols-6 items-center md:col-span-8">
        <div class="sm:col-span-3">
          <p class="text-4xl font-bold text-white">CRM Whatsapp</p>
          <p class="text-lg lg:text-base text-white">Sistema integrador que responde mensajes de clientes por Whatsapp
            desde 1 solo
            lugar y mejora
            tus
            procesos.</p>
          <Button label="Ingresar" icon="pi pi-fw pi-arrow-circle-right"
            class="bg-primary text-white w-full p-3"></Button>
        </div>
        <img class="sm:col-span-3 md:scale-150 md:translate-x-20 lg:scale-125 lg:translate-x-0" :src="FONO_BOT"
          alt="Persona usando un telefono">
      </div>
      <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
      <div class="grid grid-cols-4 gap-3">
        <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'paquetes' }"
          @click="chartShow = 'paquetes'" :variant="chartShow != 'paquetes' ? 'text' : null" label="Paquetes"></Button>
        <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'quiropracticos' }"
          @click="chartShow = 'quiropracticos'" :variant="chartShow != 'quiropracticos' ? 'text' : null"
          label="Quiropracticos"></Button>
        <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'pacientes' }"
          @click="chartShow = 'pacientes'" :variant="chartShow != 'pacientes' ? 'text' : null"
          label="Pacientes"></Button>
        <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'pagos' }"
          @click="chartShow = 'pagos'" :variant="chartShow != 'pagos' ? 'text' : null" label="Pagos"></Button>
      </div>
    </div>
    <div class="card col-span-12 xl:col-span-5 xl:py-0">
      <h2 class="text-primary">Seleccione una sede:</h2>
      <div
        class="flex flex-col gap-3 h-[40rem] md:h-auto xl:h-[40rem] overflow-y-auto md:flex-row md:overflow-x-auto xl:flex-col">
        <template v-for="(sede, i) in aSedes" :key="sede">
          <div v-if="!sede.empty"
            class="grid grid-cols-2 grid-row-1 md:flex-shrink-0 items-center p-5 rounded-md odd:bg-gray-900 even:bg-primary">
            <div class="col-span-2 sm:col-span-1">
              <p class="font-bold text-white text-2xl">{{ sede.nombre }}</p>
              <p class="text-white flex items-center gap-x-2 text-lg sm:text-xl">
                <i class="pi pi-fw pi-arrow-circle-right"></i>
                <span>{{ `Sede ${sede.id}` }}</span>
              </p>
            </div>
            <div class="hidden sm:block col-span-1 w-[100px] justify-self-end">
              <img class="w-full" :src="LOGO" alt="Logo">
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped>
.crm-whatsapp {
  background: #EA533C;
  border: 1px solid #2D2E93;
}

.chart-changer:not(.active) {
  color: var(--secondary-color) !important;
}

.chart-changer:not(.active):hover {
  background-color: var(--p-secondary-100) !important;
  color: white !important;
}
</style>