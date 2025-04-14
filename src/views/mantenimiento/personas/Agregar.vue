<script setup>
import Preloader from '@/components/Preloader.vue';
import { createPersona } from '@/service/mantenimiento/PersonaService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';

const toast = useToast()
const cancelToken = ref()

const oPersonaInfo = ref({
  tipo_documento: 'DNI',
  numero_documento: null,
  nombre: null,
  apellido: null,
  genero: 'Masculino',
  fecha_nacimiento: null,
  direccion: null,
  telefono: null,
  email: null,
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
})

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


const isPageLoading = ref(true)

const resetInputs = () => {
  oPersonaInfo.value = {
    tipo_documento: 'DNI',
    numero_documento: null,
    nombre: null,
    apellido: null,
    genero: 'Masculino',
    fecha_nacimiento: null,
    direccion: null,
    telefono: null,
    email: null,
  }
}

const crearPersona = async () => {
  isPageLoading.value = true
  try {
    for (let key in oPersonaInfo.value) {
      oInvalid.value[key] = false
      let value = oPersonaInfo.value[key]
      if (key == 'direccion') continue
      if (key == 'telefono') continue
      if (key == 'email') continue
      if (value == null || (typeof value == 'string' && value.trim().length == 0)) {
        oInvalid.value[key] = true
        isPageLoading.value = false
        return
      }
    }

    const formData = new FormData()
    formData.append('tipo_documento', oPersonaInfo.value.tipo_documento)
    formData.append('numero_documento', oPersonaInfo.value.numero_documento)
    formData.append('nombre', oPersonaInfo.value.nombre)
    formData.append('apellido', oPersonaInfo.value.apellido)
    formData.append('genero', oPersonaInfo.value.genero)
    formData.append('fecha_nacimiento', oPersonaInfo.value.fecha_nacimiento)

    if (oPersonaInfo.value.direccion)
      formData.append('direccion', oPersonaInfo.value.direccion)

    if (oPersonaInfo.value.telefono)
      formData.append('telefono', oPersonaInfo.value.telefono)

    if (oPersonaInfo.value.email)
      formData.append('email', oPersonaInfo.value.email)

    const response = await createPersona(formData)
    resetInputs()
    toast.add({
      severity: 'success',
      summary: 'Se ha creado con exito',
      detail: 'Se creo Personal de forma exitosa',
      life: 5000
    })
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Crear Persona', toast)
  }
}

isPageLoading.value = false

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})
</script>

<template>
  <div class="card w-full lg:w-[650px] relative overflow-hidden flex flex-col gap-6 pt-5">
    <Preloader v-if="isPageLoading"></Preloader>
    <p class="text-2xl font-bold m-0 text-secondary">Crear nuevo personal</p>

    <div class="grid grid-cols-4 gap-4">
      <div class="col-span-4 md:col-span-1">
        <label for="tipo_documento" class="block font-bold mb-3">Tipo Documento</label>
        <Select id="tipo_documento" v-model:model-value="oPersonaInfo.tipo_documento" fluid
          :options="aTipoDocumentoSelect" option-label="label" option-value="label"
          :invalid="oInvalid.tipo_documento"></Select>
        <small v-if="oInvalid.tipo_documento" class="text-red-500">Este campo es requerido*</small>
      </div>
      <div class="col-span-4 md:col-span-3">
        <label for="numero_documento" class="block font-bold mb-3">Numero Documento</label>
        <InputText id="numero_documento" v-model:model-value="oPersonaInfo.numero_documento" fluid
          :invalid="oInvalid.numero_documento"></InputText>
        <small v-if="oInvalid.numero_documento" class="text-red-500">Este campo es requerido*</small>
      </div>
    </div>

    <div>
      <label for="apellido" class="block font-bold mb-3">Apellido</label>
      <InputText id="apellido" v-model:model-value="oPersonaInfo.apellido" fluid :invalid="oInvalid.apellido">
      </InputText>
      <small v-if="oInvalid.apellido" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div>
      <label for="nombre" class="block font-bold mb-3">Nombre</label>
      <InputText id="nombre" v-model:model-value="oPersonaInfo.nombre" fluid :invalid="oInvalid.nombre">
      </InputText>
      <small v-if="oInvalid.nombre" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div class="grid grid-cols-6 gap-4">

      <div class="col-span-6 md:col-span-2">
        <label for="genero" class="block font-bold mb-3">Genero</label>
        <Select id="genero" v-model:model-value="oPersonaInfo.genero" fluid :options="aGenero" option-label="label"
          option-value="label" :invalid="oInvalid.genero"></Select>
        <small v-if="oInvalid.genero" class="text-red-500">Este campo es requerido*</small>
      </div>

      <div class="col-span-6 md:col-span-2">
        <label for="fecha_nacimiento" class="block font-bold mb-3">Fecha Nacimiento</label>
        <InputText id="fecha_nacimiento" type="date" v-model:model-value="oPersonaInfo.fecha_nacimiento" fluid
          :invalid="oInvalid.fecha_nacimiento"></InputText>
        <small v-if="oInvalid.fecha_nacimiento" class="text-red-500">Este campo es requerido*</small>
      </div>

      <div class="col-span-6 md:col-span-2">
        <label for="telefono" class="block font-bold mb-3">Telefono</label>
        <InputText id="telefono" v-model:model-value="oPersonaInfo.telefono" fluid :invalid="oInvalid.telefono">
        </InputText>
        <small v-if="oInvalid.telefono" class="text-red-500">Este campo es requerido*</small>
      </div>

    </div>

    <div>
      <label for="direccion" class="block font-bold mb-3">Direccion</label>
      <InputText id="direccion" v-model:model-value="oPersonaInfo.direccion" fluid :invalid="oInvalid.direccion">
      </InputText>
      <small v-if="oInvalid.direccion" class="text-red-500">Este campo es requerido*</small>
    </div>

    <div class="grid grid-cols-2 gap-4">

      <div class="col-span-2 md:col-span-1">
        <label for="email" class="block font-bold mb-3">Email</label>
        <InputText id="email" v-model:model-value="oPersonaInfo.email" fluid :invalid="oInvalid.email">
        </InputText>
        <small v-if="oInvalid.email" class="text-red-500">Este campo es requerido*</small>
      </div>
    </div>

    <Button label="Crear paciente" icon="pi pi-check" @click="crearPersona"></Button>

  </div>
</template>