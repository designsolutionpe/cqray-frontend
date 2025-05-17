<script setup>
import Preloader from '@/components/Preloader.vue';
import { createQuiropractico } from '@/service/gestion/QuiropracticoService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global Data
const toast = useToast()
const store = useStore()
const id_sede = computed(() => store.getters.id_sede)
const isSuperAdmin = computed(() => (id_sede.value == null))
const sendWhatsappDialog = ref()


const oNuevoQuiro = ref({
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
  // id_paciente: null,
  // id_quiropractico: null,
  // id_detalle_horario: null,
  // id_sede: null,
  // fecha_cita: null,
  // estado: null,
  // tipo_paciente: null,
  // observaciones: null
})

const oInvalidObj = ref({
  paciente: false,
  quiropractico: false,
  numero: false,
  fecha: false,
  horario: false,
  estado_cita: false,
  estado_paciente: false,
  observaciones: false,
  sede: false
})

// Select Input Data
const aSedesSelect = ref()
const aTipoDocumentoSelect = ref([
  { value: 'DNI' },
  { value: 'Carnet de extranjeria' },
  { value: 'RUC' },
  { value: 'Otro' },
])
const aGeneroSelect = ref([
  { value: 'Masculino' },
  { value: 'Femenino' },
])

// Selected Data
const nSedeSelected = ref()
const sNombre = ref()
const sApellido = ref()
const nTipoDocumentoSelected = ref()
const sNumeroDocumentoSelected = ref()
const sNumeroColegiatura = ref()
const nGeneroSelected = ref()
const oFechaSelected = ref(new Date())
const sNumeroTelefono = ref('')
const sDireccion = ref('')
const sContacto = ref('')
const sEmail = ref('')

// Loading State Variables
const isSedeLoading = ref(true)
const isPageLoading = ref(true)

// Retrieve Server Data

const handleServerError = (error, info) => {
  console.error(error);
  toast.add({
    severity: 'error',
    summary: 'Hubo un error obteniendo la informacion: ' + info,
    life: 5000
  })
}

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes()
    aSedesSelect.value = response.map(d => ({
      label: d.nombre,
      value: d.id
    }))
    nSedeSelected.value = aSedesSelect.value.find(s => s.value === parseInt(id_sede.value)) || null
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Sedes')
  }
}

const enviarServidor = async () => {
  oInvalidObj.value['sede'] = false
  if (
    id_sede.value == null &&
    oNuevoQuiro.value.id_sede == null &&
    nSedeSelected.value == null
  ) {
    oInvalidObj.value['sede'] = true
    return
  }
  isPageLoading.value = true
  try {
    // Peticion
    //console.log('check submit', oNuevoQuiro.value)
    const response = await createQuiropractico(oNuevoQuiro.value)
    isPageLoading.value = false
    toast.add({
      severity: 'success',
      summary: "Se ha creado el quiropractico con exito",
      life: 5000
    })
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Agregar nuevo quiropractico')
  }
}

const enableSubmit = () => {
  const ret = isSedeLoading.value
  return ret
}
// Vue Functions
watch(
  [
    isSedeLoading
  ],
  () => {
    if (
      !isSedeLoading.value
    ) {
      isPageLoading.value = false
    }
  }
)

// watch([oNuevoQuiro], () => {
//   //console.log('checking post', oNuevoQuiro.value)
// })

const formatDate = (d) => {
  return d.toISOString().split('T')[0]
}

watch([
  nTipoDocumentoSelected,
  sNumeroDocumentoSelected,
  sNombre,
  sApellido,
  nGeneroSelected,
  oFechaSelected,
  sDireccion,
  sNumeroTelefono,
  sEmail,
  nSedeSelected,
  sNumeroColegiatura,
  sContacto
], () => {
  oNuevoQuiro.value = {
    // Persona info
    tipo_documento: nTipoDocumentoSelected.value,
    numero_documento: sNumeroDocumentoSelected.value,
    nombre: sNombre.value,
    apellido: sApellido.value,
    genero: nGeneroSelected.value,
    fecha_nacimiento: formatDate(oFechaSelected.value),
    direccion: sDireccion.value,
    telefono: sNumeroTelefono.value,
    email: sEmail.value,
    foto: null,
    // Quiropractico info
    id_sede: id_sede.value ? id_sede.value : nSedeSelected.value,
    numero_colegiatura: sNumeroColegiatura.value,
    datos_contacto: sContacto.value,
    estado: 1
  }
})

onMounted(() => {
  cargarSedes()
})

</script>
<template>
  <div class="card xl:w-[650px] relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <p class="text-3xl font-bold">Agregar nuevo quiropráctico</p>
    <div>
      <div class="grid grid-cols-12 gap-y-6 md:gap-6">
        <div class="col-span-12" v-if="isSuperAdmin">
          <label for="sede" class="block font-bold mb-3">Sede</label>
          <Select id="sede" class="col-span-4 sm:col-span-3 w-full" v-model:model-value="nSedeSelected"
            :options="aSedesSelect" option-label="label" option-value="value" :disabled="isSedeLoading"
            :invalid="oInvalidObj['sede']">
          </Select>
        </div>
        <!-- Nombre -->
        <div class="col-span-12">
          <label for="nombre_quiropractico" class="block font-bold mb-3">Nombre</label>
          <InputText id="nombre_quiropractico" v-model="oNuevoQuiro.nombre" fluid>
          </InputText>
        </div>

        <!-- Apellido -->
        <div class="col-span-12">
          <label for="apellido_quiropractico" class="block font-bold mb-3">Apellido</label>
          <InputText id="apellido_quiropractico" v-model="oNuevoQuiro.apellido" fluid>
          </InputText>
        </div>

        <!-- Documentos -->
        <div class="col-span-12 grid grid-cols-6 gap-4 items-end">

          <!-- Tipo de Documento -->
          <div class="col-span-2">
            <label for="tipo_documento_quiro" class="block font-bold mb-3">Tipo de Documento</label>
            <Select id="tipo_documento_quiro" v-model:model-value="oNuevoQuiro.tipo_documento"
              :options="aTipoDocumentoSelect" option-label="value" option-value="value" class="w-full"></Select>
          </div>

          <!-- Numero de documento -->
          <div class="col-span-4">
            <label for="num_documento_quiro" class="block font-bold mb-3">Numero de Documento</label>
            <InputText id="num_documento_quiro" v-model="oNuevoQuiro.numero_documento" fluid>
            </InputText>
          </div>
        </div>

        <!-- Numero colegiatura -->
        <div class="col-span-12">
          <label for="num_colegiatura_quiro" class="block font-bold mb-3">Numero de Colegiatura</label>
          <InputText id="num_colegiatura_quiro" v-model="oNuevoQuiro.numero_colegiatura" fluid>
          </InputText>
        </div>

        <div class="col-span-12 grid grid-cols-6 gap-4 items-end">

          <!-- Genero -->
          <div class="col-span-2">
            <label for="genero_quiro" class="block font-bold mb-3">Genero</label>
            <Select id="genero_quiro" v-model:model-value="oNuevoQuiro.genero" fluid :options="aGeneroSelect"
              option-label="value" option-value="value"></Select>
          </div>

          <!-- Fecha de nacimiento -->
          <div class="col-span-4">
            <label for="fecha_nacimiento_quiro" class="block font-bold mb-3">Fecha de nacimiento</label>
            <DatePicker id="fecha_nacimiento_quiro" v-model:model-value="oNuevoQuiro.fecha_nacimiento" fluid>
            </DatePicker>
          </div>
        </div>

        <!-- Telefono -->
        <div class="col-span-12">
          <label for="telefono" class="block font-bold mb-3">Telefono</label>
          <InputMask id="telefono" v-model:model-value="oNuevoQuiro.telefono" mask="999 999 999" class="w-full">
          </InputMask>
        </div>

        <!-- Direccion -->
        <div class="col-span-12">
          <label for="direccion" class="block font-bold mb-3">Direccion</label>
          <InputText id="direccion" v-model="oNuevoQuiro.direccion" fluid>
          </InputText>
        </div>

        <!-- Numero colegiatura -->
        <div class="col-span-12">
          <label for="datos_contacto" class="block font-bold mb-3">Datos de contacto</label>
          <Textarea id="datos_contacto" v-model:model-value="oNuevoQuiro.direccion" fluid></Textarea>
        </div>
      </div>
    </div>
    <Button label="Agregar" icon="pi pi-check" class="w-full md:w-auto mt-6" @click="enviarServidor"
      :disabled="enableSubmit()"></Button>
  </div>
</template>