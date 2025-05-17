<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deletePaciente, getPacienteEstados, getPacientes, updatePaciente } from '@/service/gestion/PacienteService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { formatDate, handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

// General Variables

const store = useStore()
const toast = useToast()
const id_sede = computed(() => store.getters.id_sede)
const user_role = computed(() => store.getters.userRole)

const aPacientes = ref([])
const oFilters = ref()

const bSeePaciente = ref(false)
const bEditPaciente = ref(false)

const oPacienteInfo = ref({})

const deleteDialog = ref()

const cancelToken = ref()

// Invalid
const oInvalid = ref({
  tipo_documento: false,
  numero_documento: false,
  nombre: false,
  apellido: false,
  genero: false,
  fecha_nacimiento: false,
  direccion: false,
  telefono: false,
  email: false,
  id_sede: false,
  historia_clinica: false,
  estado: false
})

// Select Variables
const aTipoDocumentoSelect = ref([
  { label: "DNI" },
  { label: "Carnet de Extranjería".toUpperCase() },
  { label: "Pasaporte".toUpperCase() },
  { label: "Otro".toUpperCase() },
])
const aGenero = ref([
  { label: "Masculino" },
  { label: 'Femenino' }
])

const aSedeSelect = ref([])
const aEstadoPacienteSelect = ref([])

const oSedeSelected = ref()

// Loading State Variables
const isPacientesLoading = ref(true)
const isSedeLoading = ref(true)
const isEstadoPacienteLoading = ref(true)
const bUpdatePaciente = ref(false)
const isPageLoading = ref(true)

// Server Retrieve Functions

// Get all patients
const cargarPacientes = async () => {
  isPacientesLoading.value = true
  try {
    const response = await getPacientes(cancelToken.value.token)
    if (response) {
      aPacientes.value = response
        .map(p => ({
          ...p,
          persona: {
            ...p.persona,
            fecha_nacimiento: new Date(p.persona.fecha_nacimiento + 'T00:00:00')
          }
        }))
    }
    isPacientesLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Pacientes', toast)
  }
}

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedeSelect.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
      oSedeSelected.value = id_sede.value ? aSedeSelect.value.find(s => s.value == id_sede.value).label : null
    }
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'sedes', toast)
  }
}

const cargarEstadoPaciente = async () => {
  isEstadoPacienteLoading.value = true
  try {
    const response = await getPacienteEstados(cancelToken.value.token)
    if (response) {
      aEstadoPacienteSelect.value = response.map(e => ({
        label: e.nombre,
        value: e.id
      }))
    }
    isEstadoPacienteLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados paciente', toast)
  }
}

// General Functions

const initFilters = () => {
  oFilters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sede.nombre': { value: oSedeSelected, matchMode: FilterMatchMode.EQUALS },
    'persona.tipo_documento': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.numero_documento': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.apellido': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.nombre': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.genero': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.fecha_nacimiento': { value: null, matchMode: FilterMatchMode.DATE_IS },
    'estado.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    'historia_clinica': { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}
initFilters()

const cleanFilters = () => initFilters()

const updatePacienteInfo = (paciente) => {
  oPacienteInfo.value = {
    id: paciente.id,
    tipo_documento: paciente.persona.tipo_documento,
    numero_documento: paciente.persona.numero_documento,
    nombre: paciente.persona.nombre,
    apellido: paciente.persona.apellido,
    genero: paciente.persona.genero,
    fecha_nacimiento: paciente.persona.fecha_nacimiento ? paciente.persona.fecha_nacimiento.toISOString().substring(0, 10) : null,
    direccion: paciente.persona.direccion,
    telefono: paciente.persona.telefono,
    email: paciente.persona.email,
    id_sede: paciente.id_sede,
    historia_clinica: paciente.historia_clinica,
    estado: paciente.estado.id
  }
}

const onOpenViewDialog = (paciente) => {
  updatePacienteInfo(paciente)
  bSeePaciente.value = true
}

const onOpenEditDialog = (paciente) => {
  updatePacienteInfo(paciente)
  bSeePaciente.value = true
  bEditPaciente.value = true
}

const onCloseDialog = () => {
  bSeePaciente.value = false
  bEditPaciente.value = false
}

const updateCurrentPaciente = async () => {
  bUpdatePaciente.value = true
  try {

    for (let key in oPacienteInfo.value) {
      oInvalid.value[key] = false
      let value = oPacienteInfo.value[key]
      if (key == 'direccion') continue
      if (key == 'telefono') continue
      if (key == 'email') continue
      if (key == 'historia_clinica') continue
      if (value == null || (typeof value == 'string' && value.trim().length == 0)) {
        oInvalid.value[key] = true
        bUpdatePaciente.value = false
        return
      }
    }

    const formData = new FormData()
    formData.append('tipo_documento', oPacienteInfo.value.tipo_documento)
    formData.append('numero_documento', oPacienteInfo.value.numero_documento)
    formData.append('nombre', oPacienteInfo.value.nombre)
    formData.append('apellido', oPacienteInfo.value.apellido)
    formData.append('genero', oPacienteInfo.value.genero)
    formData.append('fecha_nacimiento', oPacienteInfo.value.fecha_nacimiento)

    if (oPacienteInfo.value.direccion)
      formData.append('direccion', oPacienteInfo.value.direccion)

    if (oPacienteInfo.value.telefono)
      formData.append('telefono', oPacienteInfo.value.telefono)

    if (oPacienteInfo.value.email)
      formData.append('email', oPacienteInfo.value.email)

    formData.append('id_sede', oPacienteInfo.value.id_sede)

    if (oPacienteInfo.value.historia_clinica)
      formData.append('historia_clinica', oPacienteInfo.value.historia_clinica)

    formData.append('estado', oPacienteInfo.value.estado)

    const response = await updatePaciente(oPacienteInfo.value.id, formData)
    bUpdatePaciente.value = false
    onCloseDialog()
    cargarPacientes()
    toast.add({
      severity: 'success',
      summary: 'Se actualizo con exito',
      detail: 'La actualizacion del paciente fue exitosa',
      life: 5000
    })
  }
  catch (error) {
    handleServerError(error, 'Actualizar paciente', toast)
  }
}

const onDeletePaciente = async () => {
  try {
    isPageLoading.value = true
    const response = await deletePaciente(oPacienteInfo.value.id)
    cargarSedes()
    cargarEstadoPaciente()
    cargarPacientes()
  }
  catch (error) {
    handleServerError(error, 'Eliminar paciente', toast)
  }
}

const openDeleteDialog = (paciente) => {
  updatePacienteInfo(paciente)
  deleteDialog.value.showDialog()
}

const router = useRouter()
const onOpenDirectory = (id) => {
  store.dispatch('setPacienteID', id)
  router.push('/gestion/pacientes/directorio')
}

// Watch functions

// Watch all loading variables
// to determine to page loading state
watch([
  isPacientesLoading,
  isSedeLoading,
  isEstadoPacienteLoading
], () => {
  if (
    isPacientesLoading.value ||
    isSedeLoading.value ||
    isEstadoPacienteLoading.value
  )
    isPageLoading.value = true
  else
    isPageLoading.value = false
})

// Mounted

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

// to load all server request
onMounted(() => {
  cargarSedes()
  cargarEstadoPaciente()
  cargarPacientes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="deleteDialog" title="¿Desea eliminar este paciente?" v-on:affirmation="onDeletePaciente">
    </YesNoDialog>

    <p class="text-2xl font-bold text-secondary">Todos los pacientes</p>

    <DataTable :value="aPacientes" removable-sort table-style="min-width: 50rem" data-key="id" show-gridlines
      v-model:filters="oFilters" filter-display="row" :rows="10" paginator
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} pacientes">
      <!-- Header -->
      <template #header>
        <div class="grid grid-cols-12 gap-4">
          <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-2" label="Borrar filtros"
            icon="pi pi-filter-slash" @click="cleanFilters()" outlined></Button>
          <router-link to="/gestion/pacientes/agregar" class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-2">
            <Button icon="pi pi-plus" label="Crear paciente" fluid></Button>
          </router-link>
          <IconField class="col-span-12 sm:col-span-4 lg:col-span-6 xl:col-span-8 lg:justify-self-end">
            <InputIcon>
              <i class="pi pi-search"></i>
            </InputIcon>
            <InputText class="w-full" v-model:model-value="oFilters['global'].value" placeholder="Filtro global">
            </InputText>
          </IconField>
        </div>
      </template>

      <!-- Sede Inicial -->
      <Column field="sede.nombre" header="Creado en" :show-filter-menu="false" frozen sortable style="min-width: 8rem">
        <template #body="pacienteItem">
          {{ pacienteItem.data.sede.nombre.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
            option-value="label" :options="aSedeSelect" placeholder="Filtrar por sede"
            style="min-width: 12rem;"></Select>
        </template>
      </Column>

      <!-- Tipo Documento -->
      <Column field="persona.tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable
        style="min-width: 8rem">
        <template #body="pacienteItem">
          {{ pacienteItem.data.persona.tipo_documento.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
            option-value="label" :options="aTipoDocumentoSelect" placeholder="Filtrar por Tipo Documento"
            style="min-width: 16rem;"></Select>
        </template>
      </Column>

      <!-- Numero Documento -->
      <Column field="persona.numero_documento" header="Numero Documento" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por documento" />
        </template>
      </Column>

      <!-- Apellido -->
      <Column field="persona.apellido" header="Apellido" :show-filter-menu="false" sortable style="min-width: 10rem;">
        <template #body="pacienteItem">
          {{ pacienteItem.data.persona.apellido.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por apellido" />
        </template>
      </Column>

      <!-- Nombre -->
      <Column field="persona.nombre" header="Nombre" :show-filter-menu="false" sortable style="min-width: 10rem;">
        <template #body="pacienteItem">
          {{ pacienteItem.data.persona.nombre.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por nombre" />
        </template>
      </Column>

      <!-- Genero -->
      <Column field="persona.genero" header="Genero" :show-filter-menu="false" sortable style="min-width: 8rem">
        <template #body="pacienteItem">
          {{ pacienteItem.data.persona.genero.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
            option-value="label" :options="aGenero" placeholder="Filtrar por Genero"></Select>
        </template>
      </Column>

      <!-- Fecha Nacimiento -->
      <Column field="persona.fecha_nacimiento" header="Fecha Nacimiento" :show-filter-menu="false" sortable
        style="min-width: 15rem;">
        <template #body="pacienteItem">
          {{ formatDate(pacienteItem.data.persona.fecha_nacimiento) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model="filterModel.value" :manual-input="false" @value-change="filterCallback()"
            placeholder="Filtrar por Fecha Nacimiento" date-format="dd/mm/yy">
          </DatePicker>
        </template>
      </Column>

      <!-- Estado -->
      <Column field="estado.nombre" header="Estado" :show-filter-menu="false" sortable style="min-width: 8rem">
        <template #body="pacienteItem">
          {{ pacienteItem.data.estado.nombre.toUpperCase() }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
            option-value="label" :options="aEstadoPacienteSelect" placeholder="Filtrar por estado"></Select>
        </template>
      </Column>

      <!-- Historia Clinica -->
      <Column field="historia_clinica" header="Historia Clinica" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por historia clinica" />
        </template>
      </Column>

      <!-- Acciones -->
      <Column :exportable="false" style="min-width: 15rem" :frozen="true">
        <template #body="pacienteItem">
          <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2"
            @click="onOpenViewDialog(pacienteItem.data)"></Button>
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onOpenEditDialog(pacienteItem.data)"
            :disabled="(id_sede != null) && (pacienteItem.data.id_sede != id_sede)"
            v-tooltip.top="{ value: 'Comuniquese con su SUPERADMINISTRADOR o con el ADMINISTRADOR de la sede para modificar esta cita', disabled: id_sede == null ? true : (id_sede != null) && (pacienteItem.data.id_sede == id_sede) }"></Button>
          <Button icon="pi pi-folder" outlined rounded severity='contrast' class="mr-2"
            @click="onOpenDirectory(pacienteItem.data.id)"></Button>
          <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
            @click="openDeleteDialog(pacienteItem.data)"
            :disabled="!['Desarrollador', 'Superadministrador'].includes(user_role)"
            v-tooltip.top="{ value: 'Solicita permiso a tu SUPERADMINISTRADOR, para realizar ésta acción.', disabled: ['Desarrollador', 'Superadministrador'].includes(user_role) }"></Button>
        </template>
      </Column>

    </DataTable>
    <Dialog v-model:visible="bSeePaciente" :show-header="false" modal :draggable="false" :closable="false"
      class="w-4/5 lg:w-[650px] relative overflow-hidden">
      <Preloader v-if="bUpdatePaciente"></Preloader>
      <div class="flex flex-col gap-6 pt-5">
        <p class="text-2xl font-bold m-0 text-secondary">Informacion paciente</p>

        <div class="grid grid-cols-4 gap-4">
          <div class="col-span-4 md:col-span-1">
            <label for="tipo_documento" class="block font-bold mb-3">Tipo Documento</label>
            <Select id="tipo_documento" v-model:model-value="oPacienteInfo.tipo_documento" fluid
              :disabled="!bEditPaciente" :options="aTipoDocumentoSelect" option-label="label" option-value="label"
              :invalid="oInvalid.tipo_documento"></Select>
            <small v-if="oInvalid.tipo_documento" class="text-red-500">Este campo es requerido*</small>
          </div>
          <div class="col-span-4 md:col-span-3">
            <label for="numero_documento" class="block font-bold mb-3">Numero Documento</label>
            <InputText id="numero_documento" v-model:model-value="oPacienteInfo.numero_documento" fluid
              :disabled="!bEditPaciente" :invalid="oInvalid.numero_documento"></InputText>
            <small v-if="oInvalid.numero_documento" class="text-red-500">Este campo es requerido*</small>
          </div>
        </div>

        <div>
          <label for="apellido" class="block font-bold mb-3">Apellido</label>
          <InputText id="apellido" v-model:model-value="oPacienteInfo.apellido" fluid :disabled="!bEditPaciente"
            :invalid="oInvalid.apellido">
          </InputText>
          <small v-if="oInvalid.apellido" class="text-red-500">Este campo es requerido*</small>
        </div>

        <div>
          <label for="nombre" class="block font-bold mb-3">Nombre</label>
          <InputText id="nombre" v-model:model-value="oPacienteInfo.nombre" fluid :disabled="!bEditPaciente"
            :invalid="oInvalid.nombre">
          </InputText>
          <small v-if="oInvalid.nombre" class="text-red-500">Este campo es requerido*</small>
        </div>

        <div class="grid grid-cols-6 gap-4">

          <div class="col-span-6 md:col-span-2">
            <label for="genero" class="block font-bold mb-3">Genero</label>
            <Select id="genero" v-model:model-value="oPacienteInfo.genero" fluid :disabled="!bEditPaciente"
              :options="aGenero" option-label="label" option-value="label" :invalid="oInvalid.genero"></Select>
            <small v-if="oInvalid.genero" class="text-red-500">Este campo es requerido*</small>
          </div>

          <div class="col-span-6 md:col-span-2">
            <label for="fecha_nacimiento" class="block font-bold mb-3">Fecha Nacimiento</label>
            <InputText id="fecha_nacimiento" type="date" v-model:model-value="oPacienteInfo.fecha_nacimiento" fluid
              :disabled="!bEditPaciente" :invalid="oInvalid.fecha_nacimiento"></InputText>
            <small v-if="oInvalid.fecha_nacimiento" class="text-red-500">Este campo es requerido*</small>
          </div>

          <div class="col-span-6 md:col-span-2">
            <label for="telefono" class="block font-bold mb-3">Telefono</label>
            <InputText id="telefono" v-model:model-value="oPacienteInfo.telefono" fluid :disabled="!bEditPaciente"
              :invalid="oInvalid.telefono">
            </InputText>
            <small v-if="oInvalid.telefono" class="text-red-500">Este campo es requerido*</small>
          </div>

        </div>

        <div>
          <label for="direccion" class="block font-bold mb-3">Direccion</label>
          <InputText id="direccion" v-model:model-value="oPacienteInfo.direccion" fluid :disabled="!bEditPaciente"
            :invalid="oInvalid.direccion">
          </InputText>
          <small v-if="oInvalid.direccion" class="text-red-500">Este campo es requerido*</small>
        </div>

        <div class="grid grid-cols-2 gap-4">

          <div class="col-span-2 md:col-span-1">
            <label for="email" class="block font-bold mb-3">Email</label>
            <InputText id="email" v-model:model-value="oPacienteInfo.email" fluid :disabled="!bEditPaciente"
              :invalid="oInvalid.email">
            </InputText>
            <small v-if="oInvalid.email" class="text-red-500">Este campo es requerido*</small>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label for="historia_clinica" class="block font-bold mb-3">Historia Clinica</label>
            <InputText id="historia_clinica" v-model:model-value="oPacienteInfo.historia_clinica" fluid
              :disabled="!bEditPaciente" :invalid="oInvalid.historia_clinica">
            </InputText>
            <small v-if="oInvalid.historia_clinica" class="text-red-500">Este campo es requerido*</small>
          </div>

        </div>

        <div>
          <label for="sede_nombre" class="block font-bold mb-3">Sede</label>
          <Select id="sede_nombre" v-model:model-value="oPacienteInfo.id_sede" fluid :disabled="!bEditPaciente"
            :options="aSedeSelect" option-label="label" option-value="value" :invalid="oInvalid.id_sede"></Select>
          <small v-if="oInvalid.id_sede" class="text-red-500">Este campo es requerido*</small>
        </div>

        <div>
          <label for="estado_paciente" class="block font-bold mb-3">Estado paciente</label>
          <Select id="estado_paciente" v-model:model-value="oPacienteInfo.estado" fluid :disabled="!bEditPaciente"
            :options="aEstadoPacienteSelect" option-label="label" option-value="value"
            :invalid="oInvalid.estado"></Select>
          <small v-if="oInvalid.estado" class="text-red-500">Este campo es requerido*</small>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Button :class="{ 'col-span-2': !bEditPaciente }" label="Cancelar" icon="pi pi-times" outlined
            @click="onCloseDialog"></Button>
          <Button v-if="bEditPaciente" label="Actualizar" icon="pi pi-check" @click="updateCurrentPaciente"></Button>
        </div>

      </div>
    </Dialog>
  </div>
</template>