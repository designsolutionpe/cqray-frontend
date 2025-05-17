<script setup>

import FONO_BOT from '@/assets/PERSONA BOT.png';
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { useLayout } from '@/layout/composables/layout';
import { deleteSede, getSedes, updateSede } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { charts } from './chart_data';
import LOGO from '/ICORAY.ico';

const { isDarkTheme } = useLayout();

// DASHBOARD

const chartData = ref(null);
const chartOptions = ref(null);

const chartState = ref('sedes')
const chartShow = ref('paquetes')

const isLoading = ref(true)
const isStatsLoading = ref(false)

const aSedes = ref([])
const aMonthsBySede = ref([])
const nSelectedSede = ref(null)

const cancelToken = ref()
const toast = useToast()

const toolTipProps = (text) => ({
  value: text,
  pt: {
    arrow: {
      style: {
        borderBottomColor: "var(--p-primary-color-300)"
      },
    },
    text: '!bg-secondary-300 !text-white !font-medium'
  }
})

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
  isLoading.value = true
  try {
    const sedes = await getSedes(cancelToken.value.token);
    if (sedes) {
      aSedes.value = sedes
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error al obtener las sedes:', error);
    handleServerError(error, 'Sedes', toast)
  }
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

// UPDATE SEDE ITEM

const oSedeData = ref({
  id: null,
  nombre: null,
  direccion: null,
  telefono: null,
  email: null,
  ruc: null,
  razon_social: null,
  direccion_fiscal: null
})

const bViewDialog = ref(false)
const isUpdateLoading = ref(false)

const updateSedeData = (sede) => {
  //console.log('sede seleccionada', sede)
  oSedeData.value = {
    id: sede.id,
    nombre: sede.nombre,
    direccion: sede.direccion,
    telefono: sede.telefono,
    email: sede.email,
    ruc: sede.ruc,
    razon_social: sede.razon_social,
    direccion_fiscal: sede.direccion_fiscal
  }
}

const onShowUpdateDialog = (idx) => {
  const sede = aSedes.value[idx]
  updateSedeData(sede)
  bViewDialog.value = true
}

const updateSedeFetch = async () => {
  isUpdateLoading.value = true
  try {

    const formData = new FormData()

    for (let key in oSedeData.value) {
      if (key == 'id') continue
      const value = oSedeData.value[key]
      if (value.trim().length != 0) {
        formData.append(key, value)
      }
    }

    const response = await updateSede(oSedeData.value.id, formData)
    isUpdateLoading.value = false
    cargarSedes()
    bViewDialog.value = false
    toast.add({
      severity: 'success',
      summary: 'Se ha actualizado la sede correctamente',
      life: 5000
    })
  }
  catch (error) {
    isUpdateLoading.value = false
    handleServerError(error, 'Actualizar Sede', toast)
  }
}

// Delete
const deleteDialog = ref()

const onDeleteDialog = (i) => {
  oSedeData.value.id = i
  deleteDialog.value.showDialog()
}

const onDeleteFn = async () => {
  try {
    const response = await deleteSede(oSedeData.value.id)
    cargarSedes()
  }
  catch (error) {
    handleServerError(error, 'Eliminar Sede', toast)
  }
}

watch([isDarkTheme, aSedes, aMonthsBySede, chartShow, chartState], () => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarSedes()
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card grid grid-cols-12 gap-2 relative overflow-hidden">
    <Preloader v-if="isLoading" />
    <div class="col-span-12 xl:col-span-7">
      <div
        class="card crm-whatsapp col-span-12 flex flex-col gap-5 sm:grid sm:grid-rows-1 sm:grid-cols-6 items-center md:col-span-8"
        :class="{ 'dark': isDarkTheme }">
        <div class="sm:col-span-3">
          <p class="text-4xl font-bold text-white">CRM Whatsapp</p>
          <p class="text-lg lg:text-base text-white">Sistema integrador que responde mensajes de clientes por Whatsapp
            desde 1 solo
            lugar y mejora
            tus
            procesos.</p>
          <a target="_blank" href="https://app.unichat.space/app/login">
            <Button label="Ingresar" icon="pi pi-fw pi-arrow-circle-right"
              class="bg-primary text-white w-full p-3"></Button>
          </a>
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
            class="grid grid-cols-2 grid-row-1 md:flex-shrink-0 items-center p-5 rounded-md dark:odd:bg-gray-700 dark:even:bg-primary-700 odd:bg-gray-900 even:bg-primary">
            <div class="col-span-2 sm:col-span-1">
              <p class="font-bold text-white text-2xl">{{ sede.nombre }}</p>
              <p class="text-white/60">Acciones</p>
              <div class="flex 2xl:w-auto justify-between gap-x-2 p-3 rounded-xl bg-white/10 dark:bg-black/10">
                <Button icon="pi pi-eye" severity='help' v-tooltip.top="toolTipProps('Ver estadisticas')" rounded
                  @click="cargarSede(i)"></Button>
                <Button icon="pi pi-pencil" severity='info' v-tooltip.top="toolTipProps('Editar sede')" rounded
                  @click="onShowUpdateDialog(i)"></Button>
                <Button icon="pi pi-trash" severity="danger" v-tooltip.top="toolTipProps('Eliminar sede')" rounded
                  @click="onDeleteDialog(sede.id)"></Button>
              </div>
            </div>
            <div class="hidden sm:block col-span-1 w-[100px] lg:w-[80px] justify-self-end">
              <img class="w-full" :src="LOGO" alt="Logo">
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="bViewDialog" :closable="true" modal :draggable="false" :show-header="false"
    class="w-4/5 lg:w-[450px] relative overflow-hidden">
    <div class="pt-4">
      <Preloader v-if="isUpdateLoading"></Preloader>
      <div class="flex flex-col gap-4">
        <p class="text-2xl text-secondary font-bold m-0">Editar Informacion</p>

        <div class="flex flex-col gap-4">

          <!-- Nombre -->
          <div class="flex flex-col gap-3">
            <label for="nombre_sede" class="font-bold block">Nombre</label>
            <InputText id="nombre_sede" v-model:model-value="oSedeData.nombre"></InputText>
          </div>

          <!-- Direccion -->
          <div class="flex flex-col gap-3">
            <label for="direccion_sede" class="font-bold block">Direccion</label>
            <InputText id="direccion_sede" v-model:model-value="oSedeData.direccion"></InputText>
          </div>

          <!-- Telefono -->
          <div class="flex flex-col gap-3">
            <label for="telefono_sede" class="font-bold block">Telefono</label>
            <InputText id="telefono_sede" v-model:model-value="oSedeData.telefono"></InputText>
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-3">
            <label for="email_sede" class="font-bold block">Email</label>
            <InputText id="email_sede" v-model:model-value="oSedeData.email"></InputText>
          </div>

          <!-- RUC -->
          <div class="flex flex-col gap-3">
            <label for="ruc_sede" class="font-bold block">RUC</label>
            <InputText id="ruc_sede" v-model:model-value="oSedeData.ruc"></InputText>
          </div>

          <!-- Razon Social -->
          <div class="flex flex-col gap-3">
            <label for="razon_social_sede" class="font-bold block">Razon Social</label>
            <InputText id="razon_social_sede" v-model:model-value="oSedeData.razon_social"></InputText>
          </div>

          <!-- Direccion Fiscal -->
          <div class="flex flex-col gap-3">
            <label for="direccion_fiscal_sede" class="font-bold block">Direccion Fiscal</label>
            <InputText id="direccion_fiscal_sede" v-model:model-value="oSedeData.direccion_fiscal"></InputText>
          </div>

        </div>

        <div class="grid grid-cols-2 gap-4">
          <Button class="col-span-2 md:col-span-1" outlined icon="pi pi-times" label="Cancelar"
            @click="bViewDialog = false"></Button>
          <Button class="col-span-2 md:col-span-1" icon="pi pi-check" label="Actualizar"
            @click="updateSedeFetch"></Button>
        </div>
      </div>
    </div>
  </Dialog>
  <YesNoDialog ref="deleteDialog" v-on:affirmation="onDeleteFn"
    title="¿Estas seguro de eliminar la sede? SE PERDERAN TODOS LOS DATOS"></YesNoDialog>
</template>
<style scoped>
.crm-whatsapp {
  background: var(--secondary-color);
  border: 1px solid var(--primary-color);

  &.dark {
    background-color: color-mix(in srgb, var(--p-secondary-500) calc(100% * 0.7), transparent);
  }
}

.chart-changer:not(.active) {
  color: var(--secondary-color) !important;
}

.chart-changer:not(.active):hover {
  background-color: var(--p-secondary-100) !important;
  color: white !important;
}
</style>