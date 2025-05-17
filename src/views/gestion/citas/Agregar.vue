<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { createCita, getCitaEstados } from '@/service/gestion/CitaService';
import { getPacienteEstados, getPacientes } from '@/service/gestion/PacienteService';
import { getArticulosServicios } from '@/service/mantenimiento/ArticulosService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { formatDate } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

// Global Data
const oNuevaCita = ref({
  id_paciente: null,
  // id_quiropractico: null,
  // id_detalle_horario: null,
  id_sede: null,
  id_usuario: null,
  id_paquete: null,
  historia_clinica: null,
  fecha_cita: null,
  hora_cita: null,
  estado: null,
  tipo_paciente: null,
  observaciones: null
})

const oWhatsappLinkData = ref({
  telefono: null,
  paciente: null,
  fecha: null,
  hora: null,
  sede: null
})

const toast = useToast()
const store = useStore()
const route = useRoute()
const id_sede = computed(() => store.getters.id_sede)
const id_usuario = computed(() => store.getters.id)
const isSuperAdmin = computed(() => (id_sede.value == null))
const sendWhatsappDialog = ref()

const cancelToken = ref()

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
  sede: false,
})

// Select Input Data
const aPacientesSelect = ref()
const aHorariosSelect = ref()
const aEstadosCitaSelect = ref()
const aEstadosPacienteSelect = ref()
const aSedesSelect = ref()
const aPaquetesSelect = ref()

// Selected Data
const aPacientes = ref([])
const aPaquetes = ref([])
const oPacienteSelected = ref()
// const nQuiropracticoSelected = ref()
// const nHorarioSelected = ref()
const nEstadoCitaSelected = ref()
const nEstadoPacienteSelected = ref()
const nSedeSelected = ref()
const nPaqueteSelected = ref()
const sHistorialClinica = ref('')

const dateNow = new Date()
const oFechaSelected = ref(dateNow.toISOString().substring(0, 10))
const oTiempoSelected = ref(dateNow)
const sObservaciones = ref('')
const sNumeroPaciente = ref('')
const bLinkWhatsapp = ref(false)

const bActiveHistorial = ref(false)
const bActiveNumero = ref(false)
const bActiveEstadoPaciente = ref(false)
const bActiveServicios = ref(false)

const resetAllInputs = () => {
  cargarEstadosCita()
  cargarEstadosPaciente()
  cargarSedes()
  cargarArticulos()
  cargarPacientes()
  // await cargarQuiropracticos()
  bLinkWhatsapp.value = false
}

// Loading State Variables
const isPacientesLoading = ref(true)
// const isQuiropracticosLoading = ref(true)
const isHorarioLoading = ref(true)
const isEstadosCitaLoading = ref(true)
const isEstadosPacienteLoading = ref(true)
const isSedeLoading = ref(true)
const isPaquetesLoading = ref(true)
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
    const response = await getPacientes(cancelToken.value.token)
    if (response) {
      aPacientes.value = response
      aPacientesSelect.value = response.map(d => ({
        label: `${d.persona.nombre} ${d.persona.apellido}`,
        value: d.id
      }))

      // SELECCIONAR EL PACIENTE OBTENIDO DESDE EL URL
      const paciente_ruta = response.filter(p => p.id == route.query.id)

      oPacienteSelected.value = null
      oPacienteSelected.value = paciente_ruta.length > 0 ? paciente_ruta[0].id : response[0].id

      const paciente_obj = aPacientes.value.find(p => p.id == oPacienteSelected.value)
      nEstadoPacienteSelected.value = paciente_obj.estado.id
    }
    isPacientesLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Pacientes')
  }
}

const cargarEstadosCita = async () => {
  isEstadosCitaLoading.value = true
  try {
    const response = await getCitaEstados(cancelToken.value.token)
    if (response) {
      aEstadosCitaSelect.value = response.map(d => ({
        label: d.nombre,
        value: d.id
      }))
      nEstadoCitaSelected.value = response[0].id
    }
    isEstadosCitaLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados Cita')
  }
}

const cargarEstadosPaciente = async () => {
  isEstadosPacienteLoading.value = true
  try {
    const response = await getPacienteEstados(cancelToken.value.token)
    if (response) {
      aEstadosPacienteSelect.value = response.map(d => ({
        label: d.nombre,
        value: d.id
      }))
      nEstadoPacienteSelected.value = response[0].id
    }
    isEstadosPacienteLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Estados Paciente')
  }
}

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedesSelect.value = response.map(d => ({
        label: d.nombre,
        value: d.id
      }))
      nSedeSelected.value = aSedesSelect.value.find(s => s.value == parseInt(id_sede.value))?.value || null
    }
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Sedes')
  }
}

const cargarArticulos = async () => {
  isPaquetesLoading.value = true
  try {
    const response = await getArticulosServicios(cancelToken.value.token)
    if (response) {
      //console.log('PAQUETES SERVIDOR', response)
      aPaquetes.value = response
      aPaquetesSelect.value = response.filter(q => q.tipo_articulo == 2).map(q => ({
        label: q.nombre,
        value: q.id
      }))
    }
    isPaquetesLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Paquetes')
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
    if (bLinkWhatsapp.value) {
      let paciente = aPacientes.value.find(p => p.id == oNuevaCita.value.id_paciente)
      let sede = aSedesSelect.value.find(s => s.value == oNuevaCita.value.id_sede)
      oWhatsappLinkData.value = {
        telefono: sNumeroPaciente.value,
        paciente: `${paciente.persona.nombre} ${paciente.persona.apellido}`,
        fecha: oNuevaCita.value.fecha_cita,
        hora: oNuevaCita.value.hora_cita,
        sede: sede.label
      }
      sendWhatsappDialog.value.showDialog()
    }
    resetAllInputs()
    toast.add({
      severity: 'success',
      summary: "Se ha creado la cita con exito",
      life: 5000
    })
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Agregar nueva cita')
  }
}

const sendWhatsappMessage = () => {

  const data = oWhatsappLinkData.value

  //console.log('DATA WHATSAPP', data)

  const telefono = data.telefono.replace(/\D/g, ''); // Eliminar caracteres no numéricos

  const nomPaciente = data.paciente || 'Estimado/a';

  const fixFecha = new Date(data.fecha + 'T00:00:00')
  const fecha = fixFecha ? formatDate(fixFecha) : 'de la fecha programada';

  const hora = data.hora

  const nomSede = data.sede || 'consultada';

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
    isEstadosCitaLoading.value ||
    isEstadosPacienteLoading.value ||
    isSedeLoading.value
  return ret
}
// Vue Functions

/**
 * Verifica si los campos de los que
 * se alimentan del servidor
 * ya terminaron de cargar y
 * cambia el estado de carga de la pagina
 */
watch(
  [
    isPacientesLoading,
    isEstadosCitaLoading,
    isEstadosPacienteLoading,
    isSedeLoading,
    isPaquetesLoading,
  ],
  (values) => {
    const [paciente_done, estado_cita_done, estado_paciente_done, sede_done, paquetes_done] = values

    // Return: True || False
    isPageLoading.value = (paciente_done || estado_cita_done || estado_paciente_done || sede_done || paquetes_done)
  }
)

/**
 * Actualiza historial y numero al cambiar de paciente
 */
watch(oPacienteSelected, (id_paciente) => {
  const paciente = aPacientes.value.find(p => p.id === id_paciente)
  var proximo_estado = paciente.estado.id

  //console.log("update paciente", paciente)

  // if (paciente.historial_clinico.length > 0) {
  //   let paciente = aPacientes.value.find(p => p.id === id_paciente)
  //   var paquete_activo = paciente.historial_clinico.filter(q => q.activo)
  //   if (paquete_activo.length > 0) {
  //     paquete_activo = paquete_activo[0].paquete.nombre.toLowerCase()
  //     //console.log('estados', aEstadosPacienteSelect.value, 'paquete', paquete_activo)
  //     const estado_paciente = aEstadosPacienteSelect.value.find(e => paquete_activo.includes(e.label.toLowerCase())).value
  //     if (estado_paciente != undefined) {
  //       proximo_estado = estado_paciente
  //       nPaqueteSelected.value = paciente.historial_clinico.length > 0 ? paciente.historial_clinico.filter(q => q.activo)[0].id_articulo : null
  //     }
  //   }
  //   else {
  //     nPaqueteSelected.value = null
  //   }
  // }
  // else {
  //   nPaqueteSelected.value = null
  // }

  sHistorialClinica.value = paciente.historia_clinica
  sNumeroPaciente.value = paciente.persona.telefono || ''
  nEstadoPacienteSelected.value = paciente.estado.id

  var paq_active = paciente.historial_clinico.find(q => q.activo)
  if (paq_active)
    nPaqueteSelected.value = paq_active.id_articulo

  bActiveHistorial.value = (sHistorialClinica.value != null)
  bActiveNumero.value = (sNumeroPaciente.value.trim().length != 0)
  bActiveEstadoPaciente.value = (nEstadoPacienteSelected.value != null)
  bActiveServicios.value = (nPaqueteSelected.value != null)
})

/**
 * Actualiza informmacion de cita
 * para realizar la peticion POST
 */
watch([
  oPacienteSelected,
  nEstadoPacienteSelected,
  sHistorialClinica,
  oFechaSelected,
  oTiempoSelected,
  nEstadoCitaSelected,
  sObservaciones,
  nSedeSelected,
  nPaqueteSelected
], (values) => {

  const [
    id_paciente,
    tipo_paciente,
    historia_clinica,
    fecha_cita,
    hora_cita,
    estado,
    observaciones,
    id_sede,
    id_paquete
  ] = values

  oNuevaCita.value = {
    ...oNuevaCita.value,
    id_paciente,
    historia_clinica,
    fecha_cita,
    hora_cita: hora_cita.toTimeString().slice(0, 5),
    estado,
    tipo_paciente,
    observaciones,
    id_sede,
    id_usuario: id_usuario.value,
    id_paquete
  }
})

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarEstadosCita()
  cargarEstadosPaciente()
  cargarSedes()
  cargarArticulos()
  cargarPacientes()
})

onBeforeUnmount(() => {
  //console.log("ANTES DE DESTRUIR EL COMPOE")
  cancelToken.value.cancel()
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
          <router-link to="/gestion/pacientes/agregar">
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
              :disabled="!sNumeroPaciente || sNumeroPaciente.length == 0"></Checkbox>
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
            :disabled="isEstadosPacienteLoading || bActiveEstadoPaciente"
            :invalid="oInvalidObj['estado_paciente']"></Select>
        </div>
      </div>
      <div class="col-span-12" v-if="nEstadoPacienteSelected > 2 || bActiveServicios">
        <label for="paquete_servicio" class="block font-bold mb-3">Servicios</label>
        <Select id="paquete_servicio" class="w-full" v-model:model-value="nPaqueteSelected" :options="aPaquetesSelect"
          option-label="label" option-value="value" :disabled="isPaquetesLoading || bActiveServicios"></Select>
      </div>
    </div>
    <Button label="Agregar" icon="pi pi-check" class="w-full md:w-auto mt-6" @click="enviarServidor"
      :disabled="enableSubmit()"></Button>
    <YesNoDialog ref="sendWhatsappDialog" v-on:affirmation="sendWhatsappMessage"
      title="¿Desea notificar al paciente via Whatsapp?"></YesNoDialog>
  </div>
</template>