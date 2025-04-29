<script setup>
import RegulatePackage from '@/components/gestion/pacientes/RegulatePackage.vue';
import Preloader from '@/components/Preloader.vue';
import { createPaciente, getPacienteEstados } from '@/service/gestion/PacienteService';
import { getArticulosServicios } from '@/service/mantenimiento/ArticulosService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';


const store = useStore()
const toast = useToast()
const id_sede = computed(() => store.getters.id_sede)

const cancelToken = ref()

const oPacienteInfo = ref({
  tipo_documento: 'DNI',
  numero_documento: null,
  nombre: null,
  apellido: null,
  genero: 'Masculino',
  fecha_nacimiento: null,
  direccion: null,
  telefono: null,
  email: null,
  id_sede: null,
  historia_clinica: null,
  estado: 1
})

// Invalid
const oInvalid = ref({
  tipo_documento: false,
  numero_documento: false,
  apellido: false,
  nombre: false,
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
  { label: "Carnet de Extranjería" },
  { label: "Pasaporte" },
  { label: "Otro" },
])
const aGenero = ref([
  { label: "Masculino" },
  { label: 'Femenino' }
])

const aSedeSelect = ref([])
const aEstadoPacienteSelect = ref([])

// Loading State Variables
const isSedeLoading = ref(true)
const isEstadoPacienteLoading = ref(true)
const isPaquetesLoading = ref(true)
const isPageLoading = ref(true)

const resetInputs = () => {
  oPacienteInfo.value = {
    tipo_documento: 'DNI',
    numero_documento: null,
    nombre: null,
    apellido: null,
    genero: 'Masculino',
    fecha_nacimiento: null,
    direccion: null,
    telefono: null,
    email: null,
    id_sede: null,
    historia_clinica: null,
    estado: 1
  }
}

// Server Retrieve Functions

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedeSelect.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
      oPacienteInfo.value.id_sede = aSedeSelect.value.find(s => s.value == id_sede.value)?.value || null
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
      oPacienteInfo.value = {
        ...oPacienteInfo.value,
        estado: response[0].id
      }
      console.log('paciente estad', oPacienteInfo.value)
    }
    isEstadoPacienteLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados paciente', toast)
  }
}

const aPaquetes = ref([])

const cargarPaquetes = async () => {
  isPaquetesLoading.value = true
  try {
    const response = await getArticulosServicios(cancelToken.value.token)
    if (response) {
      aPaquetes.value = response
    }
  }
  catch (error) {
    isPaquetesLoading.value = false
    handleServerError(error, 'paquetes', toast)
  }
}

const crearPaciente = async () => {
  console.log('POST', oPacienteInfo.value)
  isPageLoading.value = true
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
        isPageLoading.value = false
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
    formData.append('id_sede', oPacienteInfo.value.id_sede)

    if (oPacienteInfo.value.direccion)
      formData.append('direccion', oPacienteInfo.value.direccion)

    if (oPacienteInfo.value.telefono)
      formData.append('telefono', oPacienteInfo.value.telefono)

    if (oPacienteInfo.value.email)
      formData.append('email', oPacienteInfo.value.email)

    if (oPacienteInfo.value.historia_clinica)
      formData.append('historia_clinica', oPacienteInfo.value.historia_clinica)

    formData.append('estado', oPacienteInfo.value.estado)

    const response = await createPaciente(formData)
    cargarSedes()
    cargarEstadoPaciente()
    cargarPaquetes()
    resetInputs()
    toast.add({
      severity: 'success',
      summary: 'Se ha creado con exito',
      detail: 'Se creo el nuevo paciente de forma exitosa',
      life: 5000
    })
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Crear paciente', toast)
  }

}

// Watch functions

// Watch all loading variables
// to determine to page loading state
watch([
  isSedeLoading,
  isEstadoPacienteLoading
], ([sede, estado]) => {
  isPageLoading.value = (sede || estado)
})

const bSelectPackage = ref(false)
const bMoreInfo = ref(false)

// Check if estado is not Nuevo or Reporte

const onEstadoChanged = e => {
  const estado = e.value

  const selected = aEstadoPacienteSelect.value.find(e => e.value == estado)

  const aCheckers = ["nuevo", "reporte"]

  bSelectPackage.value = (selected && !aCheckers.includes(selected.label.toLowerCase()))

  if (!bSelectPackage.value)
    bMoreInfo.value = false
}

const onGetExtraInfo = (info) => {
  console.log('extra info', info)
}

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

// Mounted
// to load all server request
onMounted(() => {
  cargarSedes()
  cargarEstadoPaciente()
  cargarPaquetes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card w-full lg:w-[650px] relative overflow-hidden flex flex-col gap-6 pt-5">
    <Preloader v-if="isPageLoading"></Preloader>
    <p class="text-2xl font-bold m-0 text-secondary">Crear nuevo paciente</p>

    <div class="grid grid-cols-4 gap-4">
      <div class="col-span-4 md:col-span-1">
        <label for="tipo_documento" class="block font-bold mb-3">Tipo Documento</label>
        <Select id="tipo_documento" v-model:model-value="oPacienteInfo.tipo_documento" fluid
          :options="aTipoDocumentoSelect" option-label="label" option-value="label"
          :invalid="oInvalid.tipo_documento"></Select>
        <small v-if="oInvalid.tipo_documento" class="text-red-500">Este campo es requerido*</small>
      </div>
      <div class="col-span-4 md:col-span-3">
        <label for="numero_documento" class="block font-bold mb-3">Numero Documento</label>
        <!-- <InputText id="numero_documento" v-model:model-value="oPacienteInfo.numero_documento" fluid
          :invalid="oInvalid.numero_documento"></InputText> -->
        <InputNumber id="numero_documento" v-model="oPacienteInfo.numero_documento" fluid
          :invalid="oInvalid.numero_documento" :use-grouping="false"></InputNumber>
        <small v-if="oInvalid.numero_documento" class="text-red-500">Este campo es requerido*</small>
      </div>
    </div>

    <div>
      <label for="apellido" class="block font-bold mb-3">Apellido</label>
      <InputText id="apellido" v-model:model-value="oPacienteInfo.apellido" fluid :invalid="oInvalid.apellido">
      </InputText>
      <small v-if="oInvalid.apellido" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div>
      <label for="nombre" class="block font-bold mb-3">Nombre</label>
      <InputText id="nombre" v-model:model-value="oPacienteInfo.nombre" fluid :invalid="oInvalid.nombre">
      </InputText>
      <small v-if="oInvalid.nombre" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div class="grid grid-cols-6 gap-4">

      <div class="col-span-6 md:col-span-2">
        <label for="genero" class="block font-bold mb-3">Genero</label>
        <Select id="genero" v-model:model-value="oPacienteInfo.genero" fluid :options="aGenero" option-label="label"
          option-value="label" :invalid="oInvalid.genero"></Select>
        <small v-if="oInvalid.genero" class="text-red-500">Este campo es requerido*</small>
      </div>

      <div class="col-span-6 md:col-span-2">
        <label for="fecha_nacimiento" class="block font-bold mb-3">Fecha Nacimiento</label>
        <InputText id="fecha_nacimiento" type="date" v-model:model-value="oPacienteInfo.fecha_nacimiento" fluid
          :invalid="oInvalid.fecha_nacimiento"></InputText>
        <small v-if="oInvalid.fecha_nacimiento" class="text-red-500">Este campo es requerido*</small>
      </div>

      <div class="col-span-6 md:col-span-2">
        <label for="telefono" class="block font-bold mb-3">Telefono</label>
        <InputText id="telefono" v-model:model-value="oPacienteInfo.telefono" fluid :invalid="oInvalid.telefono">
        </InputText>
        <small v-if="oInvalid.telefono" class="text-red-500">Este campo es requerido*</small>
      </div>

    </div>

    <div>
      <label for="direccion" class="block font-bold mb-3">Direccion</label>
      <InputText id="direccion" v-model:model-value="oPacienteInfo.direccion" fluid :invalid="oInvalid.direccion">
      </InputText>
      <small v-if="oInvalid.direccion" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div class="grid grid-cols-2 gap-4">

      <div class="col-span-2 md:col-span-1">
        <label for="email" class="block font-bold mb-3">Email</label>
        <InputText id="email" v-model:model-value="oPacienteInfo.email" fluid :invalid="oInvalid.email">
        </InputText>
        <small v-if="oInvalid.email" class="text-red-500">Este campo es requerido*</small>
      </div>

      <div class="col-span-2 md:col-span-1">
        <label for="historia_clinica" class="block font-bold mb-3">Historia Clinica</label>
        <InputText id="historia_clinica" v-model:model-value="oPacienteInfo.historia_clinica" fluid
          :invalid="oInvalid.historia_clinica">
        </InputText>
        <small v-if="oInvalid.historia_clinica" class="text-red-500">Este campo es requerido*</small>
      </div>

    </div>

    <div>
      <label for="sede_nombre" class="block font-bold mb-3">Sede</label>
      <Select id="sede_nombre" v-model:model-value="oPacienteInfo.id_sede" fluid :options="aSedeSelect"
        option-label="label" option-value="value" :invalid="oInvalid.id_sede"></Select>
      <small v-if="oInvalid.id_sede" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div class="grid grid-cols-4 gap-3 items-center justify-between">
      <div :class="{ 'col-span-3': bSelectPackage, 'col-span-4': !bSelectPackage }">
        <label for="estado_paciente" class="block font-bold mb-3">Estado paciente</label>
        <Select id="estado_paciente" v-model:model-value="oPacienteInfo.estado" fluid :options="aEstadoPacienteSelect"
          option-label="label" option-value="value" :invalid="oInvalid.estado" @change="onEstadoChanged"></Select>
        <small v-if="oInvalid.estado" class="text-red-500">Este campo es requerido*</small>
      </div>
      <div v-if="bSelectPackage" class="col-span-1">
        <label for="more_info" class="block font-bold mb-3">Paciente en tratamiento</label>
        <Checkbox id="more_info" binary v-model:model-value="bMoreInfo"></Checkbox>
      </div>
    </div>

    <RegulatePackage v-if="bMoreInfo" :aServicios="aPaquetes" :n-estado-paciente="oPacienteInfo.estado"
      v-on:update-extra-info="onGetExtraInfo">
    </RegulatePackage>

    <Button label="Crear paciente" icon="pi pi-check" @click="crearPaciente"></Button>

  </div>
</template>