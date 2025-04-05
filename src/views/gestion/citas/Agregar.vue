<script setup>
import Preloader from '@/components/Preloader.vue';
import { createCita, getCitaEstados } from '@/service/gestion/CitaService';
import { getPacienteEstados, getPacientes } from '@/service/gestion/PacienteService';
import { getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { getHorariosDisponibles } from '@/service/mantenimiento/HorarioService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global Data
const oNuevaCita = ref({
  id_paciente: null,
  id_quiropractico: null,
  id_detalle_horario: null,
  id_sede: null,
  fecha_cita: null,
  estado: null,
  tipo_paciente: null,
  observaciones: null
})

const toast = useToast()
const store = useStore()
const id_sede = computed(() => store.getters.id_sede)
const isSuperAdmin = computed(() => (id_sede.value == null))

// Select Input Data
const aPacientesSelect = ref()
const aQuiropracticosSelect = ref()
const aHorariosSelect = ref()
const aEstadosCitaSelect = ref()
const aEstadosPacienteSelect = ref()
const aSedesSelect = ref()

// Selected Data
const oPacienteSelected = ref()
const nQuiropracticoSelected = ref()
const nHorarioSelected = ref()
const nEstadoCitaSelected = ref()
const nEstadoPacienteSelected = ref()
const nSedeSelected = ref()
const oFechaSelected = ref(new Date())
const sObservaciones = ref()

const resetAllInputs = () => {
  cargarPacientes()
  cargarQuiropracticos()
  cargarEstadosCita()
  cargarEstadosPaciente()
}

// Loading State Variables
const isPacientesLoading = ref(true)
const isQuiropracticosLoading = ref(true)
const isHorarioLoading = ref(true)
const isEstadosCitaLoading = ref(true)
const isEstadosPacienteLoading = ref(true)
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

const cargarPacientes = async () => {
  isPacientesLoading.value = true
  try {
    const response = await getPacientes()
    aPacientesSelect.value = response.map(d => ({
      label: `${d.persona.nombre} ${d.persona.apellido}`,
      value: d.id
    }))
    oPacienteSelected.value = response[0].id
    isPacientesLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Pacientes')
  }
}

const cargarQuiropracticos = async () => {
  isQuiropracticosLoading.value = true
  try {
    const response = await getQuiropracticos()
    aQuiropracticosSelect.value = response.map(d => ({
      label: `${d.persona.nombre} ${d.persona.apellido}`,
      value: d.id
    }))
    nQuiropracticoSelected.value = response[0].id
    isQuiropracticosLoading.value = false
    oNuevaCita.value = {
      ...oNuevaCita.value,
      id_quiropractico: response[0].id,
      fecha_cita: new Date().toISOString().split('T')[0]
    }
    await cargarHorarios()

  }
  catch (error) {
    handleServerError(error, 'Quiropracticos')
  }
}

const cargarHorarios = async () => {
  isHorarioLoading.value = true
  try {
    const response = await getHorariosDisponibles(
      oNuevaCita.value.fecha_cita,
      oNuevaCita.value.id_quiropractico,
      new Date(oNuevaCita.value.fecha_cita).getDay()
    )
    aHorariosSelect.value = response.map(d => ({
      label: `${d.hora_inicio} - ${d.hora_fin}`,
      value: d.id
    }))
    nHorarioSelected.value = response[0].id
    isHorarioLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Horarios')
  }
}

const cargarEstadosCita = async () => {
  isEstadosCitaLoading.value = true
  try {
    const response = await getCitaEstados()
    aEstadosCitaSelect.value = response.map(d => ({
      label: d.nombre,
      value: d.id
    }))
    nEstadoCitaSelected.value = response[0].id
    isEstadosCitaLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados Cita')
  }
}

const cargarEstadosPaciente = async () => {
  isEstadosPacienteLoading.value = true
  try {
    const response = await getPacienteEstados()
    aEstadosPacienteSelect.value = response.map(d => ({
      label: d.nombre,
      value: d.id
    }))
    nEstadoPacienteSelected.value = response[0].id
    isEstadosPacienteLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados Paciente')
  }
}

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes()
    aSedesSelect.value = response.map(d => ({
      label: d.nombre,
      value: d.id
    }))
    nSedeSelected.value = response[0].id
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Sedes')
  }
}

const enviarServidor = async () => {
  isPageLoading.value = true
  try {
    const response = await createCita(oNuevaCita.value)
    resetAllInputs()
    isPageLoading.value = false
    toast.add({
      severity: 'success',
      summary: "Se ha creado la cita con exito",
      life: 5000
    })
  }
  catch (error) {
    handleServerError(error, 'Agregar nueva cita')
  }
}

const enableSubmit = () => {
  const ret = isPacientesLoading.value ||
    isQuiropracticosLoading.value ||
    isHorarioLoading.value ||
    isEstadosCitaLoading.value ||
    isEstadosPacienteLoading.value
  return ret
}
// Vue Functions
watch(
  [
    isPacientesLoading,
    isQuiropracticosLoading,
    isHorarioLoading,
    isEstadosCitaLoading,
    isEstadosPacienteLoading
  ],
  () => {
    if (
      !isPacientesLoading.value &&
      !isQuiropracticosLoading.value &&
      !isHorarioLoading.value &&
      !isEstadosCitaLoading.value &&
      !isEstadosPacienteLoading.value
    ) {
      isPageLoading.value = false
    }
  }
)

// watch([oNuevaCita], () => {
//   console.log('checking post', oNuevaCita.value)
// })

watch([
  oPacienteSelected,
  nQuiropracticoSelected,
  nHorarioSelected,
  oFechaSelected,
  nEstadoCitaSelected,
  nEstadoPacienteSelected,
  sObservaciones,
  nSedeSelected
], () => {
  oNuevaCita.value = {
    id_paciente: oPacienteSelected.value,
    id_quiropractico: nQuiropracticoSelected.value,
    id_detalle_horario: nHorarioSelected.value,
    fecha_cita: oFechaSelected.value.toISOString().split('T')[0],
    estado: nEstadoCitaSelected.value,
    tipo_paciente: nEstadoPacienteSelected.value,
    observaciones: sObservaciones.value,
    id_sede: nSedeSelected.value ? nSedeSelected.value : id_sede.value
  }
})

watch([nQuiropracticoSelected, oFechaSelected], () => {
  cargarHorarios()
})

onMounted(() => {
  cargarPacientes()
  cargarQuiropracticos()
  cargarEstadosCita()
  cargarEstadosPaciente()
  if (isSuperAdmin.value)
    cargarSedes()
})

</script>
<template>
  <div class="card xl:w-4/5 relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <p class="text-3xl font-bold">Agregar nueva cita</p>
    <div class="grid grid-cols-12 gap-y-6 md:gap-6">
      <div class="col-span-12" v-if="isSuperAdmin">
        <label for="sede" class="block font-bold mb-3">Sede</label>
        <Select id="sede" class="col-span-4 sm:col-span-3 w-full" v-model:model-value="nSedeSelected"
          :options="aSedesSelect" option-label="label" option-value="value" :disabled="isSedeLoading">
        </Select>
      </div>
      <div class="col-span-12">
        <label for="paciente" class="block font-bold mb-3">Paciente</label>
        <div class="grid grid-cols-4 gap-4">
          <Select id="paciente" class="col-span-4 sm:col-span-3" v-model:model-value="oPacienteSelected"
            :options="aPacientesSelect" option-label="label" option-value="value" :disabled="isPacientesLoading">
          </Select>
          <Button disabled label="Agregar paciente" icon="pi pi-plus" variant='text'
            class="col-span-4 sm:col-span-1"></Button>
        </div>
      </div>
      <div class="col-span-12">
        <label for="historia_clinica" class="block font-bold mb-3">Historia Clinica</label>
        <InputText disabled id="historia_clinica" class="w-full"></InputText>
      </div>
      <div class="col-span-12">
        <label for="number" class="block font-bold mb-3">Numero</label>
        <div class="grid grid-cols-4 gap-4 items-center">
          <InputText disabled id="number" class="col-span-4 md:col-span-3"></InputText>
          <div class="col-span-4 md:col-span-1">
            <Checkbox disabled binary input-id="linkwsp" class="mr-3"></Checkbox>
            <label for="linkwsp">Link WhatsApp</label>
          </div>
        </div>
      </div>
      <div class="col-span-12">
        <label for="quiropractico" class="block font-bold mb-3">Quiropractico</label>
        <Select id="quiropractico" class="w-full" v-model:model-value="nQuiropracticoSelected"
          :options="aQuiropracticosSelect" option-label="label" option-value="value"
          :disabled="isQuiropracticosLoading">
        </Select>
      </div>
      <div class="col-span-12 grid grid-cols-4 gap-4">
        <div class="col-span-4 md:col-span-2">
          <label for="fecha" class="block font-bold mb-3">Fecha</label>
          <DatePicker id="fecha" class="col-span-3 w-full" v-model:model-value="oFechaSelected" date-format="yy/mm/dd">
          </DatePicker>
        </div>
        <div class="col-span-4 md:col-span-2">
          <label for="horario" class="block font-bold mb-3">Horario</label>
          <Select id="horario" class="col-span-3 w-full" v-model:model-value="nHorarioSelected"
            :options="aHorariosSelect" option-label="label" option-value="value" :disabled="isHorarioLoading"></Select>
        </div>
      </div>
      <div class="col-span-12">
        <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
        <Textarea id="observaciones" class="w-full" v-model:model-value="sObservaciones"></Textarea>
      </div>
      <div class="col-span-12 grid grid-cols-4 gap-4">
        <div class="col-span-4 md:col-span-2">
          <label for="estado_cita" class="block font-bold mb-3">Estado cita</label>
          <Select id="estado_cita" class="w-full" v-model:model-value="nEstadoCitaSelected"
            :options="aEstadosCitaSelect" option-label="label" option-value="value"
            :disabled="isEstadosCitaLoading"></Select>
        </div>
        <div class="col-span-4 md:col-span-2">
          <label for="estado_paciente" class="block font-bold mb-3">Estado paciente</label>
          <Select id="estado_paciente" class="w-full" v-model:model-value="nEstadoPacienteSelected"
            :options="aEstadosPacienteSelect" option-label="label" option-value="value"
            :disabled="isEstadosPacienteLoading"></Select>
        </div>
      </div>
    </div>
    <Button label="Agregar" icon="pi pi-check" class="w-full md:w-auto mt-6" @click="enviarServidor"
      :disabled="enableSubmit()"></Button>
  </div>
</template>