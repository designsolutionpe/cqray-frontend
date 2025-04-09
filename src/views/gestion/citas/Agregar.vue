<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { createCita, getCitaEstados } from '@/service/gestion/CitaService';
import { getPacienteEstados, getPacientes } from '@/service/gestion/PacienteService';
import { getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { getHorariosDisponibles } from '@/service/mantenimiento/HorarioService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { formatDate } from '@/utils/Util';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global Data
const oNuevaCita = ref({
  id_paciente: null,
  // id_quiropractico: null,
  // id_detalle_horario: null,
  id_sede: null,
  id_usuario: null,
  historia_clinica: null,
  fecha_cita: null,
  hora_cira: null,
  estado: null,
  tipo_paciente: null,
  observaciones: null
})

const toast = useToast()
const store = useStore()
const id_sede = computed(() => store.getters.id_sede)
const id_usuario = computed(() => store.getters.id)
const isSuperAdmin = computed(() => (id_sede.value == null))
const sendWhatsappDialog = ref()

const oInvalidObj = ref({
  paciente: false,
  // quiropractico: false,
  numero: false,
  fecha: false,
  hora: false,
  // horario: false,
  estado_cita: false,
  estado_paciente: false,
  observaciones: false,
  sede: false
})

// Select Input Data
const aPacientesSelect = ref()
// const aQuiropracticosSelect = ref()
const aHorariosSelect = ref()
const aEstadosCitaSelect = ref()
const aEstadosPacienteSelect = ref()
const aSedesSelect = ref()

// Selected Data
const aPacientes = ref([])
const oPacienteSelected = ref()
// const nQuiropracticoSelected = ref()
// const nHorarioSelected = ref()
const nEstadoCitaSelected = ref()
const nEstadoPacienteSelected = ref()
const nSedeSelected = ref()
const sHistorialClinica = ref('')

const dateNow = new Date()
const oFechaSelected = ref(dateNow.toISOString().substring(0, 10))
const oTiempoSelected = ref(dateNow)
const sObservaciones = ref('')
const sNumeroPaciente = ref('')
const bLinkWhatsapp = ref(false)

const bActiveHistorial = ref(false)
const bActiveNumero = ref(false)

const resetAllInputs = () => {
  cargarPacientes()
  // await cargarQuiropracticos()
  cargarEstadosCita()
  cargarEstadosPaciente()
  bLinkWhatsapp.value = false
}

// Loading State Variables
const isPacientesLoading = ref(true)
// const isQuiropracticosLoading = ref(true)
const isHorarioLoading = ref(true)
const isEstadosCitaLoading = ref(true)
const isEstadosPacienteLoading = ref(true)
const isSedeLoading = ref(true)
const isPageLoading = ref(true)
const isAbleToCreate = ref(false)

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
    aPacientes.value = response
    aPacientesSelect.value = response.map(d => ({
      label: `${d.persona.nombre} ${d.persona.apellido}`,
      value: d.id
    }))
    oPacienteSelected.value = response[0].id

    if (response[0].persona.telefono)
      bActiveNumero.value = true
    if (response[0].historia_clinica)
      bActiveHistorial.value = true

    sNumeroPaciente.value = response[0].persona.telefono
    sHistorialClinica.value = response[0].historia_clinica
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
    // await cargarHorarios()

  }
  catch (error) {
    handleServerError(error, 'Quiropracticos')
  }
}

const cargarHorarios = async () => {
  isHorarioLoading.value = true

  try {

    const fechaSeleccionada = new Date(oNuevaCita.value.fecha_cita + 'T00:00:00');
    let dia = fechaSeleccionada.getDay();
    if (dia === 0) {
      dia = 6;
    } else {
      dia -= 1;
    }

    const response = await getHorariosDisponibles(
      oNuevaCita.value.fecha_cita,
      oNuevaCita.value.id_quiropractico,
      dia
    )

    aHorariosSelect.value = response.map(d => ({
      label: `${d.hora_inicio} - ${d.hora_fin}`,
      value: d.id
    }))
    if (response.length > 0)
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
    nSedeSelected.value = aSedesSelect.value.find(s => s.value == parseInt(id_sede.value)).value || null
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
    oNuevaCita.value.id_sede == null &&
    nSedeSelected.value == null
  ) {
    oInvalidObj.value['sede'] = true
    return
  }
  isPageLoading.value = true
  try {
    const response = await createCita(oNuevaCita.value)
    if (bLinkWhatsapp.value)
      sendWhatsappDialog.value.showDialog()
    resetAllInputs()
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

const sendWhatsappMessage = () => {
  const telefono = sNumeroPaciente.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos

  // Podríamos tomar datos como la fecha y hora de la cita, y el nombre completo del paciente
  const paciente = aPacientesSelect.value.find(p => p.value === oPacienteSelected.value)
  const nomPaciente = paciente.label || 'Estimado/a';

  const fixFecha = new Date(oFechaSelected.value + 'T00:00:00')
  const fecha = fixFecha ? formatDate(fixFecha) : 'de la fecha programada';

  const hora = oTiempoSelected.value.toTimeString().slice(0, 5)
  // const horarioSelecciodo = aHorariosSelect.value.find((h) => h.value === nHorarioSelected.value);
  // const hora = horarioSelecciodo ? horarioSelecciodo.label : 'seleccionado';

  const sedeSeleccionada = aSedesSelect.value.find(s => s.value === nSedeSelected.value);
  const nomSede = sedeSeleccionada ? sedeSeleccionada.label : 'consultada';

  const mensaje =
    `¡${nomPaciente}!\n\n` +
    `Esperemos estes teniendo un buen dia, te recordamos que tienes una cita *${fecha} ${hora}* en la *${nomSede}*.\n\n` +
    `Para brindarte la mejor atención quiropráctica.\n\n` +
    `Por favor confirme su asistencia por este medio, de igual forma si tiene alguna duda o requiere reprogramar no dude en avisarnos.`;

  // Generar el enlace de WhatsApp
  const enlace = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  window.open(enlace, '_blank');
}

const enableSubmit = () => {
  const ret = isPacientesLoading.value ||
    // isQuiropracticosLoading.value ||
    // isHorarioLoading.value ||
    isEstadosCitaLoading.value ||
    isEstadosPacienteLoading.value ||
    isSedeLoading.value
  return ret
}
// Vue Functions
watch(
  [
    isPacientesLoading,
    // isQuiropracticosLoading,
    // isHorarioLoading,
    isEstadosCitaLoading,
    isEstadosPacienteLoading,
    isSedeLoading
  ],
  () => {
    if (
      !isPacientesLoading.value &&
      // !isQuiropracticosLoading.value &&
      // !isHorarioLoading.value &&
      !isEstadosCitaLoading.value &&
      !isEstadosPacienteLoading.value &&
      !isSedeLoading.value
    ) {
      isPageLoading.value = false
    } else
      isPageLoading.value = true
  }
)

// watch([oNuevaCita], () => {
//   console.log('checking post', oNuevaCita.value)
// })

watch([
  oPacienteSelected,
  // nQuiropracticoSelected,
  sHistorialClinica,
  oFechaSelected,
  oTiempoSelected,
  nEstadoCitaSelected,
  nEstadoPacienteSelected,
  sObservaciones,
  nSedeSelected
], () => {

  sHistorialClinica.value = aPacientes.value.find(p => p.id === oPacienteSelected.value).historia_clinica
  sNumeroPaciente.value = aPacientes.value.find(p => p.id === oPacienteSelected.value).persona.telefono

  bActiveHistorial.value = (sHistorialClinica.value != null)
  bActiveNumero.value = (sNumeroPaciente.value != null)

  console.log('FECHA', oFechaSelected.value, oTiempoSelected.value)

  oNuevaCita.value = {
    id_paciente: oPacienteSelected.value,
    // id_quiropractico: nQuiropracticoSelected.value,
    // id_detalle_horario: 1,
    historia_clinica: sHistorialClinica.value,
    fecha_cita: oFechaSelected.value,
    hora_cita: oTiempoSelected.value.toTimeString().slice(0, 5),
    estado: nEstadoCitaSelected.value,
    tipo_paciente: nEstadoPacienteSelected.value,
    observaciones: sObservaciones.value,
    id_sede: nSedeSelected.value,
    id_usuario: id_usuario.value
  }
})

// watch([nQuiropracticoSelected, oFechaSelected], () => {
//   cargarHorarios()
// })

onMounted(() => {
  cargarPacientes()
  // cargarQuiropracticos()
  cargarEstadosCita()
  cargarEstadosPaciente()
  cargarSedes()
})

</script>
<template>
  <div class="card xl:w-4/5 relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <p class="text-3xl font-bold text-secondary">Agregar nueva cita</p>
    <div class="grid grid-cols-12 gap-y-6 md:gap-6">
      <div class="col-span-12">
        <label for="sede" class="block font-bold mb-3">Sede</label>
        <Select id="sede" class="col-span-4 sm:col-span-3 w-full" v-model:model-value="nSedeSelected"
          :options="aSedesSelect" option-label="label" option-value="value" :disabled="isSedeLoading"
          :invalid="oInvalidObj['sede']">
        </Select>
      </div>
      <div class="col-span-12">
        <label for="paciente" class="block font-bold mb-3">Paciente</label>
        <div class="grid grid-cols-4 gap-4">
          <Select id="paciente" class="col-span-4 sm:col-span-3" v-model:model-value="oPacienteSelected"
            :options="aPacientesSelect" option-label="label" option-value="value" :disabled="isPacientesLoading"
            :invalid="oInvalidObj['paciente']" filter>
          </Select>
          <router-link to="/gestion/paciente">
            <Button label="Agregar paciente" icon="pi pi-plus" variant='text' class="col-span-4 sm:col-span-1"></Button>
          </router-link>
        </div>
      </div>
      <div class="col-span-12">
        <label for="historia_clinica" class="block font-bold mb-3">Historia Clinica</label>
        <InputText id="historia_clinica" class="w-full" v-model:model-value="sHistorialClinica" maxlength="20"
          :disabled="bActiveHistorial">
        </InputText>
      </div>
      <div class="col-span-12">
        <label for="number" class="block font-bold mb-3">Numero</label>
        <div class="grid grid-cols-4 gap-4 items-center">
          <!-- <InputText id="number" class="col-span-4 md:col-span-3" v-model:model-value="sNumeroPaciente"
            :invalid="oInvalidObj['numero']"></InputText> -->
          <InputMask id="number" class="col-span-4 md:col-span-3" v-model:model-value="sNumeroPaciente"
            placeholder="999 999 999" mask="999 999 999" :invalid="oInvalidObj['numero']" :disabled="bActiveNumero">
          </InputMask>
          <div class="col-span-4 md:col-span-1">
            <Checkbox binary input-id="linkwsp" class="mr-3" v-model:model-value="bLinkWhatsapp"
              :disabled="sNumeroPaciente.length == 0"></Checkbox>
            <label for="linkwsp">Link WhatsApp</label>
          </div>
        </div>
      </div>
      <!-- <div class="col-span-12">
        <label for="quiropractico" class="block font-bold mb-3">Quiropractico</label>
        <Select id="quiropractico" class="w-full" v-model:model-value="nQuiropracticoSelected"
          :options="aQuiropracticosSelect" option-label="label" option-value="value" :disabled="isQuiropracticosLoading"
          :invalid="oInvalidObj['quiropractico']" filter>
        </Select>
      </div> -->
      <div class="col-span-12 grid grid-cols-4 gap-4">
        <div class="col-span-4 md:col-span-2">
          <label for="fecha" class="block font-bold mb-3">Fecha</label>
          <!--
          <DatePicker id="fecha" class="col-span-3 w-full" v-model:model-value="oFechaSelected" date-format="yy/mm/dd"
            :invalid="oInvalidObj['fecha']">
          </DatePicker>
          -->
          <InputText id="fecha_cita" type="date" v-model:model-value="oFechaSelected" fluid />
        </div>
        <div class="col-span-4 md:col-span-2">
          <label for="hora_cita" class="block font-bold mb-3">Hora</label>
          <DatePicker id="hora_cita" class="col-span-3 w-full" hour-format="12" v-model:model-value="oTiempoSelected"
            time-only>
          </DatePicker>
          <!-- <Select id="horario" class="col-span-3 w-full" v-model:model-value="nHorarioSelected"
            :options="aHorariosSelect" option-label="label" option-value="value" :disabled="isHorarioLoading"
            :invalid="oInvalidObj['horario']"></Select> -->
        </div>
      </div>
      <div class="col-span-12">
        <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
        <Textarea id="observaciones" class="w-full" v-model:model-value="sObservaciones"
          :invalid="oInvalidObj['observaciones']"></Textarea>
      </div>
      <div class="col-span-12 grid grid-cols-4 gap-4">
        <div class="col-span-4 md:col-span-2">
          <label for="estado_cita" class="block font-bold mb-3">Estado cita</label>
          <Select id="estado_cita" class="w-full" v-model:model-value="nEstadoCitaSelected"
            :options="aEstadosCitaSelect" option-label="label" option-value="value" :disabled="isEstadosCitaLoading"
            :invalid="oInvalidObj['estado_cita']"></Select>
        </div>
        <div class="col-span-4 md:col-span-2">
          <label for="estado_paciente" class="block font-bold mb-3">Estado paciente</label>
          <Select id="estado_paciente" class="w-full" v-model:model-value="nEstadoPacienteSelected"
            :options="aEstadosPacienteSelect" option-label="label" option-value="value"
            :disabled="isEstadosPacienteLoading" :invalid="oInvalidObj['estado_paciente']"></Select>
        </div>
      </div>
    </div>
    <Button label="Agregar" icon="pi pi-check" class="w-full md:w-auto mt-6" @click="enviarServidor"
      :disabled="enableSubmit()"></Button>
    <YesNoDialog ref="sendWhatsappDialog" v-on:affirmation="sendWhatsappMessage"
      title="¿Desea notificar al paciente via Whatsapp?"></YesNoDialog>
  </div>
</template>