<script setup>
import Preloader from '@/components/Preloader.vue';
import { getComprobantes } from '@/service/gestion/ComprobanteService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// GLOBAL VARIABLES

// Filters

const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sede.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    serie: { value: null, matchMode: FilterMatchMode.CONTAINS },
    persona: { value: null, matchMode: FilterMatchMode.CONTAINS },
    total: { value: null, matchMode: FilterMatchMode.CONTAINS }
    // historia_clinica: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // apellido: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // balance_pagos: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const aSedesSelect = ref([])

initFilters()

const resetFilters = () => initFilters()

// Loading State
const isSedesLoading = ref(true)
const isPagosLoading = ref(true)
const isPageLoading = ref(true)

// Table Data
const aHistorialPagos = ref([
  // { sede: 'Sede Chiclayo', identificacion: '123456789', historia_clinica: '123456', nombre: 'Paciente 1', apellido: 'Apellido 10', balance_pagos: '15.50' },
  // { sede: 'Sede Lima', identificacion: '234567891', historia_clinica: '234567', nombre: 'Paciente 2', apellido: 'Apellido 9', balance_pagos: '16.00' },
  // { sede: 'Sede Huancayo', identificacion: '345678912', historia_clinica: '345678', nombre: 'Paciente 3', apellido: 'Apellido 8', balance_pagos: '16.50' },
  // { sede: 'Sede Chiclayo', identificacion: '456789123', historia_clinica: '456789', nombre: 'Paciente 4', apellido: 'Apellido 7', balance_pagos: '17.00' },
  // { sede: 'Sede Lima', identificacion: '567891234', historia_clinica: '567891', nombre: 'Paciente 5', apellido: 'Apellido 6', balance_pagos: '17.50' },
  // { sede: 'Sede Lima', identificacion: '678912345', historia_clinica: '678912', nombre: 'Paciente 6', apellido: 'Apellido 5', balance_pagos: '18.00' },
  // { sede: 'Sede Chiclayo', identificacion: '789123456', historia_clinica: '789123', nombre: 'Paciente 7', apellido: 'Apellido 4', balance_pagos: '18.50' },
  // { sede: 'Sede Piura', identificacion: '891234567', historia_clinica: '891234', nombre: 'Paciente 8', apellido: 'Apellido 3', balance_pagos: '19.00' },
  // { sede: 'Sede Piura', identificacion: '912345678', historia_clinica: '912345', nombre: 'Paciente 9', apellido: 'Apellido 2', balance_pagos: '19.50' },
  // { sede: 'Sede Chiclayo', identificacion: '123456789', historia_clinica: '123456', nombre: 'Paciente 10', apellido: 'Apellido 1', balance_pagos: '20.00' },
])

const cargarPagos = async () => { }


// Ver Pagos

const bVerDialogPago = ref(false)

const oSelectedPago = ref({})

const updatePagoInfo = (pago) => {
  oSelectedPago.value = pago
}

const onOpenPagoDialog = (pago) => {
  updatePagoInfo(pago)
  bVerDialogPago.value = true
}

// Peticiones servidor

const cancelToken = ref()
const toast = useToast()

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
    handleServerError(error, 'Obtener sedes', toast)
  }
}

const cargarComprobantes = async () => {
  isPagosLoading.value = true
  try {
    const response = await getComprobantes(cancelToken.value.token)
    if (response) {
      aHistorialPagos.value = response.data
      //console.log('pagos', aHistorialPagos.value)
    }
    isPagosLoading.value = false
  }
  catch (error) {
    isPagosLoading.value = false
    handleServerError(error, 'obtener comprobantes', toast)
  }
}

watch([isSedesLoading, isPagosLoading], ([sedes, pagos]) => {
  isPageLoading.value = (sedes || pagos)
})

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarSedes()
  cargarComprobantes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-3xl font-bold text-secondary">Historal de pagos</p>
      <DataTable :value="aHistorialPagos" v-model:filters="filters" removable-sort table-style="min-width: 30rem"
        filter-display="row" data-key="id" paginator show-gridlines :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} pagos">

        <!-- Header -->
        <template #header>
          <div class="flex justify-between">
            <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText v-model:model-value="filters['global'].value" placeholder="Filtro global"></InputText>
            </IconField>
          </div>
        </template>

        <Column field="sede.nombre" header="Sede" sortable :show-filter-menu="false" style="min-width: 10rem">
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aSedesSelect"
              option-label="label" option-value="label" placeholder="Filtrar por sede"></Select>
          </template>
        </Column>

        <Column field="persona" header="Persona" sortable :show-filter-menu="false" style="min-width: 10rem">
          <template #body="item">
            {{ `${item.data.persona.nombre} ${item.data.persona.apellido}` }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por persona"></InputText>
          </template>
        </Column>


        <Column field="serie" header="Identificacion" sortable :show-filter-menu="false" style="min-width: 8rem;">
          <template #body="item">
            {{ `${item.data.serie} ${item.data.numero}` }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por identificacion"></InputText>
          </template>
        </Column>

        <Column field="total" header="Total pagado" sortable :show-filter-menu="false" style="min-width: 8rem">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por precio"></InputText>
          </template>
        </Column>

        <Column :exportable="false" style="min-width: 10rem">
          <template #body="pagoItem">
            <Button disabled icon="pi pi-dollar" label="Ver pago" severity='success' rounded class="mr-2"
              @click="onOpenPagoDialog(pagoItem.data)" v-tooltip.top="{ value: 'En mantenimiento' }"></Button>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>
  <Dialog v-bind:visible="bVerDialogPago" modal :closable="false" :draggable="false"
    class="w-4/5 lg:w-[450px] relative overflow-hidden" :show-header="false">
    <div class="flex flex-col gap-4 pt-5">
      <p class="text-2xl font-bold text-secondary">Informacion de pago</p>

      <div class="flex flex-col gap-3">
        <p class="text-lg font-bold m-0">Identificacion:</p>
        <InputText v-model:model-value="oSelectedPago.identificacion" disabled></InputText>
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-lg font-bold m-0">Historia Clinica:</p>
        <InputText v-model:model-value="oSelectedPago.historia_clinica" disabled></InputText>
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-lg font-bold m-0">Nombre:</p>
        <InputText v-model:model-value="oSelectedPago.nombre" disabled></InputText>
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-lg font-bold m-0">Apellido:</p>
        <InputText v-model:model-value="oSelectedPago.apellido" disabled></InputText>
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-lg font-bold m-0">Balance de pago:</p>
        <InputText v-model:model-value="oSelectedPago.balance_pagos" disabled></InputText>
      </div>

      <Button icon="pi pi-times" label="Cerrar" @click="bVerDialogPago = false"></Button>
    </div>
  </Dialog>
</template>