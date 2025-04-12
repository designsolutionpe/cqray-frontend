<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deleteCategoria, getCategorias, updateCategoria } from '@/service/mantenimiento/ArticulosService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// GLOBAL VARIABLES

const toast = useToast()

const aCategorias = ref([])

// Filters
const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

initFilters()

const resetFilters = () => initFilters()

const aEstadoSelect = ref([
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 2 },
])

// Loading State
const isPageLoading = ref(true)
const isUpdateCategoria = ref(false)

// Dialog

const bOpenEditDialog = ref(false)
const rOpenDeleteDialog = ref()

const sNombreInput = ref()
const nEstadoSelected = ref()

const oCategoriaData = ref({
  id: null
})

watch([sNombreInput, nEstadoSelected], (values) => {
  const [nombre, estado] = values
  oCategoriaData.value = {
    ...oCategoriaData.value,
    nombre,
    estado
  }
})

const updateCategoriaData = (data) => {
  console.log('selected data', data)
  oCategoriaData.value.id = data.id
  sNombreInput.value = data.nombre
  nEstadoSelected.value = data.estado
}

const onEditDialog = (data) => {
  updateCategoriaData(data)
  bOpenEditDialog.value = true
}

const sendCategoriaData = async () => {
  isUpdateCategoria.value = true
  try {
    const response = await updateCategoria(oCategoriaData.value.id, oCategoriaData.value)
    console.log('categoria update', response)
    isUpdateCategoria.value = false
    bOpenEditDialog.value = false
    cargarCategorias()
  }
  catch (error) {
    isUpdateCategoria.value = false
    handleServerError(error)
  }
}

const onDeleteDialog = (data) => {
  updateCategoriaData(data)
  rOpenDeleteDialog.value.showDialog()
}

const onDeleteCategoria = async () => {
  isPageLoading.value = true
  try {
    await deleteCategoria(oCategoriaData.value.id)
    cargarCategorias()
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Eliminar categoria', toast)
  }
}

// Peticiones

const cargarCategorias = async () => {
  isPageLoading.value = true
  try {
    const response = await getCategorias(cancelToken.value.token)
    if (response) {
      console.log('categorias', response)
      aCategorias.value = response
    }
    isPageLoading.value = false
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Categorias', toast)
  }
}

// Peticiones Config

const cancelToken = ref()

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarCategorias()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Todas las Categorias</p>
      <DataTable :value="aCategorias" removable-sort table-style="min-width: 50rem" data-key="id" show-gridlines
        v-model:filters="filters" filter-display="row" :rows="10" paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} categorias"
        :global-filter-fields="['nombre', 'estado']">

        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-6 lg:col-span-3 xl:col-span-2" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <IconField class="col-span-12 sm:col-span-6 lg:col-span-9 xl:col-span-10 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>

        <Column field="nombre" header="Nombre" :show-filter-menu="false" sortable style="min-width: 8rem;">
          <template #body="estadoItem">
            {{ estadoItem.data.nombre.toUpperCase() }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por nombre" class="w-full"></InputText>
          </template>
        </Column>

        <Column field="estado" header="Estado" :show-filter-menu="false" sortable style="min-width: 10rem;">
          <template #body="estadoItem">
            {{aEstadoSelect.find(e => e.value == estadoItem.data.estado).label.toUpperCase()}}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aEstadoSelect"
              option-label="label" option-value="value" placeholder="Filtrar por estado" class="w-full"></Select>
          </template>
        </Column>

        <Column :exportable="false" style="width: 8rem;">
          <template #body="estadoItem">
            <Button icon="pi pi-pencil" outlined rounded severity="info" class="mr-2"
              @click="onEditDialog(estadoItem.data)"></Button>
            <Button icon="pi pi-trash" outlined rounded severity="danger"
              @click="onDeleteDialog(estadoItem.data)"></Button>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>
  <YesNoDialog ref="rOpenDeleteDialog" title="¿Desea eliminar esta categoria?" v-on:affirmation="onDeleteCategoria">
  </YesNoDialog>
  <Dialog v-model:visible="bOpenEditDialog" modal :draggable="false" header="Editar categoria"
    class="w-4/5 lg:w-[450px] relative overflow-hidden">
    <Preloader v-if="isUpdateCategoria"></Preloader>
    <div class="flex flex-col gap-4">
      <div>
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText id="nombre" v-model:model-value="sNombreInput" placeholder="Ingrese el nombre de la categoria" fluid>
        </InputText>
      </div>
      <div>
        <label for="estado" class="block font-bold mb-3">Estado</label>
        <Select id="estado" v-model:model-value="nEstadoSelected" fluid :options="aEstadoSelect" option-label="label"
          option-value="value" placeholder="Seleccione un estado"></Select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Button class="col-span-2 md:col-span-1" icon="pi pi-times" label="Cancelar" outlined
          @click="bOpenEditDialog = false"></Button>
        <Button class="col-span-2 md:col-span-1" icon="pi pi-check" label="Actualizar"
          @click="sendCategoriaData"></Button>
      </div>
    </div>
  </Dialog>
</template>