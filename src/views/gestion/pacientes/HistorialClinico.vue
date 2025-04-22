<script setup>
import Preloader from '@/components/Preloader.vue';
import { getCitaEstados } from '@/service/gestion/CitaService';
import { getHistorialesPacientes } from '@/service/gestion/HistorialesClinicos';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Data

const aHistoriales = ref([])

const filters = ref({})

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sede.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    'paquete.nombre': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'paciente.persona': { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado_pago: { value: null, matchMode: FilterMatchMode.EQUALS },
    cita: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

initFilters()

const resetFilters = () => initFilters()

const getEstadoCita = (item, target) => {
  switch (item) {
    case 1:
      if (target == 'severity') return 'warn'
      else if (target == 'text') return 'Confirmacion pendiente'
    case 2:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Confirmado'
    case 3:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Atendido'
    case 4:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Cancelado'
    default:
      if (target == 'severity') return 'secondary'
      else if (target == 'text') return 'Sin definir'
  }
}

const getEstadoPago = (item, target) => {
  console.log('estado', 'item', item, 'target', target)
  switch (item) {
    case 0:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Pendiente'
    case 1:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Pagado'
    case 2:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Deuda'
  }
}

// Select

const aSedesSelect = ref([])
const aEstadoPagoSelect = ref([
  { label: 'Pagado', value: 1 },
  { label: 'Deuda', value: 2 },
])
const aEstadoCitaSelect = ref([])

// Loading State

const isSedesLoading = ref(true)
const isHistorialesLoading = ref(true)
const isEstadoCitaLoading = ref(true)
const isPageLoading = ref(true)

// Server fetches

const toast = useToast()
const cancelToken = ref()

const cargarSedes = async () => {
  isSedesLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedesSelect.value = response.map(s => ({
        label: s.nombre
      }))
    }
    isSedesLoading.value = false
  }
  catch (error) {
    isSedesLoading.value = false
    handleServerError(error, 'Sedes', toast)
  }
}

const cargarHistoriales = async () => {
  isHistorialesLoading.value = true
  try {
    const response = await getHistorialesPacientes(cancelToken.value.token);
    if (response) {
      aHistoriales.value = response
    }
    isHistorialesLoading.value = false
  }
  catch (error) {
    isHistorialesLoading.value = false
    handleServerError(error, 'Historiales', toast)
  }
}

const cargarEstadoCitas = async () => {
  isEstadoCitaLoading.value = true
  try {
    const response = await getCitaEstados(cancelToken.value.token)
    if (response) {
      aEstadoCitaSelect.value = response.map(e => ({
        label: e.nombre,
        value: e.id
      }))
    }
    isEstadoCitaLoading.value = false
  }
  catch (error) {
    isEstadoCitaLoading.value = false
    handleServerError(error, 'estado citas', toast)
  }
}

watch([
  isSedesLoading,
  isHistorialesLoading,
  isEstadoCitaLoading
], ([sedes, historiales, estado_cita]) => {
  isPageLoading.value = (sedes || historiales || estado_cita)
})

// Vue functions


onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarSedes()
  cargarHistoriales()
  cargarEstadoCitas()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden md:w-[650px] lg:w-full">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-3xl font-bold text-secondary">Historial Clinico</p>
      <DataTable :value="aHistoriales" v-model:filters="filters" removable-sort table-style="min-width: 50rem"
        filter-display="row" data-key="id" paginator show-gridlines :rows="10"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} registros">
        <!-- Header -->
        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <IconField class="col-span-12 sm:col-span-8 lg:col-span-9 xl:col-span-9 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>

        <!-- Sede -->
        <Column field="sede.nombre" header="Sede" sortable style="min-width: 5rem" :show-filter-menu="false">
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" :options="aSedesSelect" option-label="label"
              option-value="label" @change="filterCallback()" placeholder="Filtrar por sede"></Select>
          </template>
        </Column>

        <!-- Paquete -->
        <Column field="paquete.nombre" header="Paquetes" sortable style="min-width: 6rem" :show-filter-menu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por paquete"></InputText>
          </template>
        </Column>

        <Column field="paciente.persona" header="Paciente" sortable style="min-width: 8rem" :show-filter-menu="false">
          <template #body="item">
            {{ `${item.data.paciente.persona.nombre} ${item.data.paciente.persona.apellido}` }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por paciente"></InputText>
          </template>
        </Column>

        <!-- Estado pago -->
        <Column field="estado_pago" header="Estado de pago" sortable style="min-width: 6rem" :show-filter-menu="false">
          <template #body="item">
            <Tag :severity="getEstadoPago(item.data.estado_pago, 'severity')">
              {{ getEstadoPago(item.data.estado_pago, 'text') }}
            </Tag>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" :options="aEstadoPagoSelect" option-label="label"
              option-value="value" placeholder="Filtrar por estado pago" @change="filterCallback()"></Select>
          </template>
        </Column>

        <!-- Estado cita -->
        <Column field="cita" header="Estado de Cita" sortable style="min-width: 8rem" :show-filter-menu="false">
          <template #body="item">
            <Tag :severity="getEstadoCita(item.data.cita ? item.data.cita.estado : null, 'severity')">
              {{ getEstadoCita(item.data.cita ? item.data.cita.estado : null, 'text') }}
            </Tag>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" :options="aEstadoCitaSelect" option-label="label"
              option-value="label" placeholder="Filtrar por estado cita" @change="filterCallback()">
            </Select>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>