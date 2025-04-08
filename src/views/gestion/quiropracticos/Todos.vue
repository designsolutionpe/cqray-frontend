<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deleteQuiropractico, getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { formatDate } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global Data
const toast = useToast()

const store = useStore()

const id_sede = computed(() => store.getters.id_sede)

const oQuiropracticoValues = ref({
  id: null,
  // Persona info
  tipo_documento: null,
  numero_documento: null,
  nombre: null,
  apellido: null,
  genero: null,
  fecha_nacimiento: null,
  direccion: null,
  telefono: null,
  email: null,
  foto: null,
  // Quiropractico info
  id_sede: id_sede.value ? id_sede.value : null,
  numero_colegiatura: null,
  datos_contacto: null,
  estado: null
})

const aQuiropracticos = ref([])
const filters = ref()

const deleteDialog = ref()
const editDialog = ref(false)

// Loading state Variables
const isQuiropracticosLoading = ref(true)
const isPageLoading = ref(true)

// Select Data
const aTipoDocumentoSelect = ref([
  { value: 'DNI' },
  { value: 'Carnet de Extranjeria' },
  { value: 'Pasaporte' },
  { value: 'Otro' },
])
const aGeneroSelect = ref([
  { value: 'Masculino' },
  { value: 'Femenino' },
])

// Additional Functions
const handleServerError = (error, info) => {
  console.error(error);
  toast.add({
    severity: 'error',
    summary: 'Hubo un error obteniendo la informacion: ' + info,
    life: 5000
  })
}

const initFilters = () => {
  filters.value = {
    'persona.tipo_documento': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.nombre': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.apellido': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.genero': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.fecha_nacimiento': { value: null, matchMode: FilterMatchMode.DATE_IS }
  }
}

initFilters()

const resetFilters = () => initFilters()

const updateQuiroSelected = (quiro) => {
  oQuiropracticoValues.value = {
    id: quiro.id,
    // Persona info
    tipo_documento: quiro.persona.tipo_documento,
    numero_documento: quiro.persona.numero_documento,
    nombre: quiro.persona.nombre,
    apellido: quiro.persona.apellido,
    genero: quiro.persona.genero,
    fecha_nacimiento: quiro.persona.fecha_nacimiento,
    direccion: quiro.persona.direccion,
    telefono: quiro.persona.telefono,
    email: quiro.persona.email,
    foto: quiro.persona.foto,
    // Quiropractico info
    id_sede: id_sede.value ? id_sede.value : null,
    numero_colegiatura: quiro.numero_colegiatura,
    datos_contacto: quiro.datos_contacto,
    estado: quiro.estado
  }
}

const editQuiro = (quiro) => {
  updateQuiroSelected(quiro)
}

const deleteQuiro = (quiro) => {
  updateQuiroSelected(quiro)
  deleteDialog.value.showDialog()
}

// Retrieve Server Data
const cargarQuiropracticos = async () => {
  isQuiropracticosLoading.value = true
  try {
    const response = await getQuiropracticos()
    aQuiropracticos.value = response.map(q => ({
      ...q,
      persona: {
        ...q.persona,
        fecha_nacimiento: new Date(q.persona.fecha_nacimiento)
      }
    }))
    isQuiropracticosLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Quiropracticos')
  }
}

const deleteFn = async () => {
  isPageLoading.value = true
  try {
    const response = await deleteQuiropractico(oQuiropracticoValues.value.id)
    cargarQuiropracticos()
    isPageLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Eliminar quiropractico')
  }
}

watch([
  isQuiropracticosLoading
], () => {
  if (isQuiropracticosLoading.value)
    isPageLoading.value = true
  else
    isPageLoading.value = false
})

onMounted(() => {
  cargarQuiropracticos()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="deleteDialog"
      :title="`¿Desea eliminar este quiropractico? \n ${oQuiropracticoValues.apellido} ${oQuiropracticoValues.nombre}`"
      v-on:affirmation="deleteFn">
    </YesNoDialog>
    <p class="text-3xl font-bold text-secondary">Todos los quiroprácticos</p>
    <DataTable v-model:filters="filters" :value="aQuiropracticos" removable-sort table-style="min-width: 50rem"
      filter-display="row" data-key="id" paginator show-gridlines :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas">
      <!-- Header -->
      <template #header>
        <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
      </template>

      <!-- ID -->
      <Column field="id" header="#" sortable style="min-width: 3rem;"></Column>

      <!-- Tipo Documento -->
      <Column field="persona.tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable
        style="min-width: 5rem">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aTipoDocumentoSelect"
            option-label="value" option-value="value" placeholder="Filtrar por Tipo Documento"></Select>
        </template>
      </Column>

      <!-- Apellidos -->
      <Column field="persona.apellido" header="Apellidos" :show-filter-menu="false" sortable style="min-width: 10rem">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model:model-value="filterModel.value" @input="filterCallback()" type="text"
            placeholder="Filtrar por apellido"></InputText>
        </template>
      </Column>

      <!-- Nombres -->
      <Column field="persona.nombre" header="Nombres" :show-filter-menu="false" sortable style="min-width: 10rem">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model:model-value="filterModel.value" @input="filterCallback()" type="text"
            placeholder="Filtrar por nombre"></InputText>
        </template>
      </Column>

      <!-- Genero -->
      <Column field="persona.genero" header="Genero" :show-filter-menu="false" sortable style="min-width: 8rem">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aGeneroSelect"
            option-label="value" option-value="value" placeholder="Filtrar por genero"></Select>
        </template>
      </Column>

      <!-- Fecha Nacimiento -->
      <Column field="persona.fecha_nacimiento" header="Fecha nacimiento" :show-filter-menu="false" sortable
        style="min-width: 12rem">
        <template #body="quiropracticoItem">
          {{ formatDate(quiropracticoItem.data.persona.fecha_nacimiento) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model:model-value="filterModel.value" :manual-input="false" @value-change="filterCallback()"
            placeholder="Filtrar por fecha de nacimineto" date-format="dd/mm/yy"></DatePicker>
        </template>
      </Column>

      <!-- Acciones -->
      <Column :exportable="false" style="min-width: 8rem">
        <template #body="quiropracticoItem">
          <Button icon="pi pi-pencil" outlined rounded severity="info" class="mr-2"
            @click="editQuiro(quiropracticoItem.data)"></Button>
          <Button icon="pi pi-trash" outlined rounded severity="danger"
            @click="deleteQuiro(quiropracticoItem.data)"></Button>
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="editDialog" :show-header="false" modal :draggable="false" :closable="false"
      class="w-4/5 lg:w-2/3 relative overflow-hidden">

      <div class="flex gap-4">

        <!-- Foto -->
        <div class="grid grid-cols-2 gap-3">
          <FileUpload mode="basic" name="foto" accept="image/*" choose-label="Seleccionar" :max-file-size="1000000"
            @select="onFileSelect" custom-upload auto class="p-button-outlined"></FileUpload>
        </div>
        <!-- Data -->

      </div>

    </Dialog>
  </div>
</template>