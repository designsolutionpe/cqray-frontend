<script setup>

import FONO_BOT from '@/assets/PERSONA BOT.png';
import Preloader from '@/components/Preloader.vue';
import { useLayout } from '@/layout/composables/layout';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { onMounted, ref, watch } from 'vue';
import { charts } from './chart_data';
import LOGO from '/ICORAY.ico';

const { isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);

const chartState = ref('sedes')
const chartShow = ref('paquetes')

const isLoading = ref(true)
const isStatsLoading = ref(false)

const aSedes = ref([])
const aMonthsBySede = ref([])
const nSelectedSede = ref(null)

function setChartData() {
  var labels, datasets = null;

  if (chartState.value == 'sedes') {
    labels = aSedes.value.map(e => e.nombre)
    datasets = charts.datasets[chartShow.value].map(e => {
      const d = Array(aSedes.value.length).fill().map(e => Math.floor(Math.random() * 50))
      e.data = d
      return e
    })
  } else if (chartState.value == 'sede') {
    labels = aMonthsBySede.value
    datasets = charts.datasets[chartShow.value].map(e => {
      const d = Array(aMonthsBySede.value.length).fill().map(e => Math.floor(Math.random() * 50))
      e.data = d
      return e
    })
  }

  return {
    labels, // Meses
    datasets
  };
}

function setChartOptions() {
  var loadOptions = charts.options[chartShow.value]

  if (chartState.value == 'sede') {
    const sedeName = aSedes.value[nSelectedSede.value].nombre
    loadOptions.plugins.title.text = sedeName
  } else {
    loadOptions.plugins.title.text = "Todas las sedes"
  }

  return loadOptions
}

const changeChart = (show) => {
  chartShow.value = show
  chartState.value = 'sedes'
}

const cargarSedes = async () => {
  try {
    const sedes = await getSedes();
    aSedes.value = sedes
  } catch (error) {
    console.error('Error al obtener las sedes:', error);
  }
  isLoading.value = false
};

const cargarSede = async (sedeID) => {
  if (sedeID == nSelectedSede.value) return
  try {
    isStatsLoading.value = true
    setTimeout(() => {
      var quantityMonths = Math.floor(Math.random() * 12) + 1
      if (quantityMonths < 5) quantityMonths = 5
      const months = Array(quantityMonths).fill().map((m, i) => new Date(0, i + 1, 0).toLocaleDateString('es-PE', { month: 'long' }))
      aMonthsBySede.value = months
      chartState.value = 'sede'
      nSelectedSede.value = sedeID
      isStatsLoading.value = false
    }, 3000)
  }
  catch (error) {
    console.error('Error al obtener las sedes:', error);
  }
}

watch([isDarkTheme, aSedes, aMonthsBySede, chartShow, chartState], () => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})

onMounted(() => {
  cargarSedes()
  chartData.value = setChartData()
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
      <div class="relative">
        <Preloader v-if="isStatsLoading" />
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-80" />
        <div class="grid grid-cols-4 gap-3 mt-5">
          <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'paquetes' }"
            @click="changeChart('paquetes')" :variant="chartShow != 'paquetes' ? 'text' : null"
            label="Paquetes"></Button>
          <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'quiropracticos' }"
            @click="changeChart('quiropracticos')" :variant="chartShow != 'quiropracticos' ? 'text' : null"
            label="Quiropracticos"></Button>
          <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'pacientes' }"
            @click="changeChart('pacientes')" :variant="chartShow != 'pacientes' ? 'text' : null"
            label="Pacientes"></Button>
          <Button class="col-span-4 sm:col-span-1 chart-changer" :class="{ 'active': chartShow == 'pagos' }"
            @click="changeChart('pagos')" :variant="chartShow != 'pagos' ? 'text' : null" label="Pagos"></Button>
        </div>
      </div>
    </div>
    <div class="card col-span-12 xl:col-span-5 xl:py-0">
      <h2 class="text-primary">Seleccione una sede:</h2>
      <div
        class="flex flex-col gap-3 h-[40rem] md:h-auto xl:h-[40rem] overflow-y-auto md:flex-row md:overflow-x-auto xl:flex-col">
        <template v-for="(sede, i) in aSedes" :key="sede">
          <div v-if="!sede.empty"
            class="grid grid-cols-2 grid-row-1 md:flex-shrink-0 items-center p-5 rounded-md odd:bg-gray-900 even:bg-primary"
            @click="cargarSede(i)">
            <div class="col-span-2 sm:col-span-1">
              <p class="font-bold text-white text-2xl">{{ sede.nombre }}</p>
              <p class="text-white flex items-center gap-x-2 text-lg sm:text-xl">
                <i class="pi pi-fw pi-arrow-circle-right"></i>
                <span>{{ `Sede ${sede.id}` }}</span>
              </p>
            </div>
            <div class="hidden sm:block col-span-1 w-[100px] lg:w-[80px] justify-self-end">
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