<script setup>
import { getCitasForSelect } from '@/service/gestion/CitaService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Preloader from '../Preloader.vue';

const props = defineProps({
  onSendCitaSelected: {
    type: Function,
    required: true
  },
  dontShowCitas: {
    type: Array,
    required: true
  },
  sPaciente: {
    type: String,
    required: true
  },
  idSedePaciente: {
    type: Number,
    required: true
  },
  idPaciente: {
    type: Number,
    required: true
  }
})

const bShow = ref(false)
const toast = useToast()

const cancelToken = ref()
const bIsCitasLoading = ref(true)
const bDialogLoading = ref(true)

const filters = ref({})

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}

initFilters()

const resetFilter = () => initFilters()

const aCitas = ref([])

const citaSelected = ref(null)

const showDialog = () => {
  bShow.value = true
  citaSelected.value = null
}

const onCitaSelected = () => {
  bShow.value = false
  props.onSendCitaSelected(citaSelected.value)
}

const cargarCitas = async () => {
  bIsCitasLoading.value = true
  try {
  //alert("sede "+props.idSedePaciente+" paciente "+props.idPaciente)
    const response = await getCitasForSelect(cancelToken.value.token,props.idSedePaciente,props.idPaciente)
    if (response) {
      aCitas.value = response
    }
    bIsCitasLoading.value = false
  }
  catch (error) {
    bIsCitasLoading.value = false
    handleServerError(error, 'Error al obtener las citas', toast)
  }
}

watch(
  [
    bIsCitasLoading,
  ],
  ([citas]) => {
    bDialogLoading.value = (citas)
  }
)

watch(bShow , (show) => {
    if(show)
    {
        cargarCitas();
        console.log(props)
    }
})

// watch(
//   props.sPaciente,
//   (paciente) => {
//     aCitas.value = response.filter(c => `${c.nombre} ${c.apellido}` == paciente)
//   }
// )

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

defineExpose({ showDialog })

</script>
<template>
  <Dialog v-model:visible="bShow" :show-header="false" modal :draggable="false" :closable="false"
    class="w-4/5 lg:w-[650px] relative overflow-hidden">
    <Preloader v-if="bDialogLoading"></Preloader>
    <div class="flex flex-col gap-6 pt-5">
      <p class="text-2xl font-bold m-0 text-secondary">Selecciona la cita</p>
      <DataTable :value="aCitas" table-style="min-width: 50rem" v-model:selection="citaSelected" data-key="id"
        show-gridlines v-model:filters="filters" :rows="5" paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas">
        <!-- Header -->
        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3" label="Borrar filtros" icon="pi pi-filter-slash"
              @click="resetFilter()" outlined></Button>
            <IconField class="col-span-12 sm:col-span-4 lg:col-span-9 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>
        <Column selection-mode="single" style="width: 3rem"></Column>
        <Column field="id" header="#" style="min-width: 3rem">
          <template #body="item">{{ item.index + 1 }}</template>
        </Column>
        <Column field="sede.nombre" header="Sede" style="min-width: 4rem"></Column>
        <Column field="paciente" header="Paciente" style="min-width: 4rem">
          <template #body="item">
            {{ `${item.data.paciente.persona.nombre} ${item.data.paciente.persona.apellido}` }}
          </template>
        </Column>
        <Column field="fecha_cita" header="Fecha"></Column>
        <Column field="hora_cita" header="Hora"></Column>
        <Column field="estado.nombre" header="Estado"></Column>
      </DataTable>
    </div>
    <div class="flex flex-col lg:flex-row gap-4 mt-6">
      <Button icon="pi pi-times" label="Cancelar" outlined @click="bShow = false"></Button>
      <Button icon="pi pi-check" label="Seleccionar" :disabled="!citaSelected" @click="onCitaSelected"></Button>
    </div>
  </Dialog>
</template>