<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deleteUnidadMedida, getUnidadMedidas, updateUnidadMedidad } from '@/service/mantenimiento/UnidadMedidaService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';


const toast = useToast()
const cancelToken = ref()

const aUnidades = ref([])

// Loading States
const isUnidadMedidaLoading = ref(true)
const isPageLoading = ref(true)

// Filters
const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}

initFilters()

const resetFilters = () => initFilters()

// Cargar datos

const cargarUnidadMedidas = async () => {
  isUnidadMedidaLoading.value = true
  try {
    const response = await getUnidadMedidas(cancelToken.value.token)
    if (response) {
      console.log('unidades', response)
      aUnidades.value = response
    }
    isUnidadMedidaLoading.value = false
  }
  catch (error) {
    isUnidadMedidaLoading.value = false
    handleServerError(error, 'Unidad de medida', toast)
  }
}

watch([
  isUnidadMedidaLoading
], ([unidad]) => {
  isPageLoading.value = (unidad)
})

// Vue functions

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarUnidadMedidas()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

// EDITAR SECTION

const bEditView = ref(false)

const isUpdatingUnidad = ref(false)

const oUnidadSelected = ref({})

const sNombreInput = ref('')

watch([
  sNombreInput
], ([nombre]) => {
  oUnidadSelected.value = {
    ...oUnidadSelected.value,
    nombre
  }
})

const resetAll = () => {
  cargarUnidadMedidas()
  oUnidadSelected.value = {}
  sNombreInput.value = null
  bEditView.value = false
}

const onOpenDialog = (id) => {
  const unidad = aUnidades.value.find(u => u.id === id)
  oUnidadSelected.value = unidad
  sNombreInput.value = unidad.nombre
  bEditView.value = true
}

const updateUnidad = async () => {
  isUpdatingUnidad.value = true
  try {
    console.log('unidad', oUnidadSelected.value)
    const response = await updateUnidadMedidad(oUnidadSelected.value.id, oUnidadSelected.value);
    console.log('response', response)
    isUpdatingUnidad.value = false
    resetAll()
  }
  catch (error) {
    isUpdatingUnidad.value = false
    handleServerError(error, 'Actualizando la unidad', toast)
  }
}

const deleteDialog = ref()

const onDeleteDialog = (unidad) => {
  oUnidadSelected.value = {
    ...oUnidadSelected.value,
    ...unidad
  }
  deleteDialog.value.showDialog()
}

const deleteUnidad = async () => {
  try {
    const response = await deleteUnidadMedida(oUnidadSelected.value.id)
    cargarUnidadMedidas()
  }
  catch (error) {
    handleServerError(error, 'Actualizando la unidad', toast)
  }
}

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="deleteDialog"
      title="Deseas eliminar esta medida? PRECAUCION: ESTA ACCION ES IRREVERSIBLE Y AFECTARA A TODOS LOS PRODUCTOS/SERVICIOS ASOCIADOS"
      @affirmation="deleteUnidad"></YesNoDialog>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Todas las unidades de medida</p>
      <DataTable :value="aUnidades" removable-sort table-style="min-width: 50rem" data-key="id" show-gridlines
        v-model:filters="filters" filter-display="row" :rows="10" paginator
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} unidades">

        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <router-link to="/mantenimiento/unidad-medida/agregar"
              class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3">
              <Button icon="pi pi-plus" label="Crear unidad de medida" fluid></Button>
            </router-link>
            <IconField class="col-span-12 sm:col-span-4 lg:col-span-6 xl:col-span-6 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>

        <Column field="id" header="#" sortable style="width: 4rem;">
          <template #body="item">
            {{ item.index + 1 }}
          </template>
        </Column>

        <Column field="nombre" header="Nombre" sortable style="min-width: 8rem" :show-filter-menu="false">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por nombre" fluid></InputText>
          </template>
        </Column>

        <!-- Acciones -->
        <Column :exportable="false" style="width: 8.2rem" header="Acciones">
          <template #body="item">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onOpenDialog(item.data.id)"></Button>
            <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
              @click="onDeleteDialog(item.data)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
    <Dialog v-model:visible="bEditView" :show-header="false" modal :draggable="false" :closable="false"
      class="w-4/5 lg:w-[650px] relative overflow-hidden">
      <Preloader v-if="isUpdatingUnidad"></Preloader>
      <div class="flex flex-col gap-6 pt-5">
        <p class="text-2xl font-bold m-0">Informacion de unidad</p>
        <div>
          <label for="unidad_nombre" class="block font-bold mb-3">Nombre</label>
          <InputText id="unidad_nombre" v-model:model-value="sNombreInput" fluid></InputText>
        </div>
        <div class="grid grid-cols-2 gap-5">
          <Button class="col-span-2 md:col-span-1" outlined label="Cancelar"></Button>
          <Button class="col-span-2 md:col-span-1" label="Guardar cambios" @click="updateUnidad"></Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>