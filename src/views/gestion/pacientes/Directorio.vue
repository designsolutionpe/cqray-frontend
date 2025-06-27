<script setup>
import SeleccionaCita from '@/components/dialogs/SeleccionaCita.vue';
import DatosPersonalesTab from '@/components/gestion/pacientes/directorio/DatosPersonalesTab.vue';
import DocumentosTab from '@/components/gestion/pacientes/directorio/DocumentosTab.vue';
import HistorialServiciosTab from '@/components/gestion/pacientes/directorio/HistorialServiciosTab.vue';
import Preloader from '@/components/Preloader.vue';
import { linkWithCita } from '@/service/gestion/HistorialesClinicos';
import { getPaciente } from '@/service/gestion/PacienteService';
import { formatDate, handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const isPageLoading = ref(true)

const store = useStore()
const toast = useToast()
const id_paciente = computed(() => store.getters.id_paciente)
const router = useRouter()

const cancelToken = ref()

const oPacienteInfo = ref({
  sede: {
    nombre: null
  },
  persona: {
    numero_documento: null
  },
  estado: {
    nombre: null
  },
  historia_clinica: null,
  historial_servicios: [],
  historial_clinico: [],
  documentos: [],
  citas: [],
  events: [],
  paquete_activo: {
    paquete: {
      nombre: ''
    }
  }
})
const aPacientes = ref([])
const p_estado = ref()

const n_paquetes_activos = ref([])

const changeEstadoBackground = (estado) => {
  //console.log(estado)
  switch (estado) {
    case 'Nuevo':
      p_estado.value.classList.add('bg-green-400')
      break;
    case 'Reporte':
      p_estado.value.classList.add('bg-blue-400')
      break;
    case 'Plan':
      p_estado.value.classList.add('bg-orange-400')
      break;
    case 'Mantenimiento':
      p_estado.value.classList.add('bg-red-400')
      break;
    case 'Individual':
      p_estado.value.classList.add('bg-yellow-400')
      break;
    default:
      p_estado.value.classList.add('bg-brown-400')
      break;
  }
}

const getEstadoPago = (item, target) => {
  //console.log('estado', 'item', item, 'target', target)
  switch (item) {
    case 0:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Pendiente'
    case 1:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Pagado'
    case 2:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Deuda'
  }
}

const getEstadoCita = (item, target) => {
  switch (item) {
    case 1:
      if (target == 'severity') return 'warn'
      else if (target == 'text') return 'Confirmacion pendiente'
    case 2:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Confirmado'
    case 3:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Atendido'
    case 4:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Cancelado'
    default:
      if (target == 'severity') return 'secondary'
      else if (target == 'text') return 'Sin definir'
  }
}

const cargarPaciente = async () => {
  isPageLoading.value = true
  try {
    const response = await getPaciente(id_paciente.value, cancelToken.value.token)
    if (response) {
      aPacientes.value = [response]
      oPacienteInfo.value = response
      console.log('PACIENTE', oPacienteInfo.value)
      // changeEstadoBackground(response.estado.nombre)
      oPacienteInfo.value.citas = oPacienteInfo.value.citas.map(c => ({
        ...c,
        hora_cita: new Date(c.fecha_cita + 'T' + c.hora_cita) || null
      }))
      n_paquetes_activos.value = response.historial_clinico.filter(i => i.activo)
      //console.log('paquetes activos', n_paquetes_activos.value)
      //console.log(oPacienteInfo.value.citas)
      isPageLoading.value = false
    }
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Obtener informacion paciente', toast)
  }
}

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarPaciente()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

const seleccionaCitaRef = ref()
const registrosActivoDisponibles = ref([])
const selectedRegistro = ref(null)
const sPacienteNombre = ref('')

watch(
  oPacienteInfo,
  ({ persona: { nombre, apellido } }) => {
    sPacienteNombre.value = `${nombre} ${apellido}`
    //console.log('paciente nombre', sPacienteNombre.value)
  }
)

const onSelectCita = (item_id) => {
  selectedRegistro.value = item_id
  registrosActivoDisponibles.value = n_paquetes_activos.value.map(q => q.id)
  //console.log('registros activos disponibles', registrosActivoDisponibles.value)
  seleccionaCitaRef.value.showDialog()
}

const onCitaSelected = async (param) => {
  const id_cita = param.id
  isPageLoading.value = true
  try {
    const response = await linkWithCita(selectedRegistro.value, id_cita)
    toast.add({ severity: 'success', summary: 'Link completado con exito', life: 3000 })
    cargarPaciente()
    isPageLoading.value = false
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'actualizar historial', toast)
  }
}

</script>
<template>
  <SeleccionaCita ref="seleccionaCitaRef" :dont-show-citas="registrosActivoDisponibles" :sPaciente="sPacienteNombre"
    :idSedePaciente="oPacienteInfo.id_sede || -1" :idPaciente="oPacienteInfo.id || -1"
    v-on:send-cita-selected="onCitaSelected">
  </SeleccionaCita>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="mb-5 flex flex-col md:flex-row gap-4">
      <p class="text-2xl font-bold text-secondary m-0">Directorio</p>
      <router-link :to="`/gestion/citas/agregar?id=${id_paciente}`">
        <Button icon="pi pi-plus" label="Agregar cita" class="w-full"></Button>
      </router-link>
      <router-link to="/gestion/ventas/agregarconstanciapago">
        <Button icon="pi pi-plus" label="Realizar venta" class="w-full"></Button>
      </router-link>
    </div>
    <div class="grid grid-cols-4 gap-3">
      <div class="col-span-4 card border-2 !rounded-3xl flex-auto !p-3">
        <Tabs value="0" scrollable>
          <TabList>
            <Tab value="0">Datos Personales</Tab>
            <Tab value="1">Historial Citas</Tab>
            <Tab value="2">Historial de Servicio</Tab>
            <Tab value="3">Documentos</Tab>
            <Tab value="4" disabled>Timeline</Tab>
          </TabList>
          <TabPanels>
            <!-- Datos personales -->
            <TabPanel value="0">
              <DatosPersonalesTab :oPaciente="oPacienteInfo" />
            </TabPanel>
            <!-- Historial Citas -->
            <TabPanel value="1">
              <DataTable :value="oPacienteInfo.citas" removable-sort table-style="min-width: 20rem" scrollable
                scroll-height="500px" data-key="id" show-gridlines>

                <Column field="fecha_cita" header="Fecha" sortable style="min-width: 5rem;">
                  <template #body="citaItem">
                    {{ formatDate(citaItem.data.fecha_cita) }}
                  </template>
                </Column>

                <Column field="hora_cita" header="Hora" sortable style="min-width: 8rem">
                  <template #body="citaItem">
                    {{ citaItem.data.hora_cita != 'Invalid Date' ? citaItem.data.hora_cita.toLocaleTimeString() : null
                    }}
                  </template>
                </Column>

                <Column field="sede.nombre" header="Quiropractico" sortable style="min-width: 15rem;">
                  <template #body="citaItem">
                    Quiropractico - {{ citaItem.data.sede.nombre.split(' ')[1] }}
                  </template>
                </Column>

                <Column field="estado.nombre" header="Estado" sortable style="min-width: 13rem"></Column>

                <!-- <Column :exportable="false" style="min-width: 9rem;">
                  <template #body="pacienteItem">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="null"></Button>
                    <Button icon="pi pi-trash" severity='danger' outlined rounded class="mr-2" @click="null"></Button>
                  </template>
                </Column> -->

              </DataTable>
            </TabPanel>
            <!-- Historial de Servicio -->
            <TabPanel value="2">
              <HistorialServiciosTab :a-servicios="oPacienteInfo.historial_servicios" />
            </TabPanel>
            <TabPanel value="3">
              <DocumentosTab :a-documentos="oPacienteInfo.documentos" />
            </TabPanel>
            <TabPanel value="4" class="h-[600px] overflow-auto">
              <Timeline :value="oPacienteInfo.events" align="alternate" class="w-full">
                <template #content="item">
                  <div class="card border-4">
                    <p class="text-xl m-0 font-bold text-secondary">{{ item.item.titulo }}</p>
                    <p class="text-md m-0 font-bold text-gray-400">{{ new Date(item.item.fecha).toLocaleString() }}</p>
                    <p v-if="item.item.atendido" class="text-lg m-0 font-semibold">{{ item.item.atendido }}</p>
                  </div>
                </template>
              </Timeline>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <!-- <div class="col-span-4 lg:col-span-1 flex flex-col gap-4 justify-between">
        <div class="card border-2 !rounded-xl flex flex-col gap-4">
          <p class="text-xl font-bold text-center md:text-left lg:text-center md:w-max lg:w-auto m-0">ID: {{
            oPacienteInfo.persona.numero_documento }}</p>
          <div>
            <p class="text-xl font-bold text-center md:text-left lg:text-center md:w-max lg:w-auto mb-2">Estado
              paciente:</p>
            <p ref="p_estado"
              class="bg-gray-300 text-white font-bold rounded-full text-center md:text-left lg:text-center md:w-max lg:w-auto px-4 py-2 text-lg">
              Paciente {{
                oPacienteInfo.estado.nombre }}
            </p>
          </div>
          <div>
            <p class="text-xl font-bold text-center md:text-left lg:text-center md:w-max lg:w-auto mb-2">Paquete actual:
            </p>
            <p
              class="bg-red-600 text-white text-center md:text-left lg:text-center md:w-max lg:w-auto font-bold rounded-full px-4 py-2 text-lg">
              <span class="block text-center">{{ oPacienteInfo.paquete_activo.paquete.nombre }}</span>
            </p>
            <p class="block text-center">{{n_paquetes_activos.filter(i => i.cita !=
              null).length.toString().padStart(3, '0')}}
              / {{
                n_paquetes_activos.length.toString().padStart(3, '0') }}</p>
            <p class="block text-center">Precio S/{{ oPacienteInfo.paquete_activo.paquete.precio_venta }}</p>
          </div>
          <div>
            <p class="text-xl font-bold text-center md:text-left lg:text-center md:w-max lg:w-auto mb-2">Historia
              Clinica</p>
            <p class="text-center md:text-left lg:text-center md:w-max lg:w-auto font-medium text-lg">{{
              oPacienteInfo.historia_clinica ||
              '<sin informacion>' }}</p>
          </div>
          <div>
            <p class="text-xl font-bold text-center md:text-left lg:text-center md:w-max lg:w-auto mb-2">Deuda</p>
            <p class="text-center md:text-left lg:text-center md:w-max lg:w-auto font-medium text-lg">S/ {{
              parseFloat(oPacienteInfo.deuda / 100).toFixed(2) || parseFloat(0).toFixed(2) }}</p>
          </div>
        </div>
      </div> -->

    </div>
  </div>
</template>