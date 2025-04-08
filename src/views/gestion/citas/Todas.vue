<script setup>
import Preloader from '@/components/Preloader.vue'
import YesNoDialog from '@/components/YesNoDialog.vue'
import { deleteCita, getCitaEstados, getCitas, updateCita } from '@/service/gestion/CitaService'
import { getPacienteEstados } from '@/service/gestion/PacienteService'
import { getHorariosDisponibles } from '@/service/mantenimiento/HorarioService'
import { getSedes } from '@/service/mantenimiento/SedeService'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const toast = useToast()

const store = useStore()
const isSedeLoading = ref(true)
const isEstadoCitaLoading = ref(true)
const isEstadoPacienteLoading = ref(true)
const isCitasLoading = ref(true)
const isCitaUpdateLoading = ref(false)
const isLinkWhatsappActive = ref(false)
const sLinkWhatsappActive = ref('')

const id_sede = computed(() => store.getters.id_sede)

const citasTable = ref([])

const sedesSelect = ref([
  { label: '---', value: null }
])
const estadoCitaSelect = ref([
  { label: '---', value: null }
])
const estadoPacienteSelect = ref([
  { label: '---', value: null }
])
const horariosSelect = ref([
  { label: '---', value: null }
])

const sedeSelected = ref(null)
const estadoCitaSelected = ref(null)
const estadoPacienteSelected = ref(null)

const filters = ref()

const initFilters = () => {
  filters.value = {
    'sede.nombre': { value: sedeSelected, matchMode: FilterMatchMode.EQUALS },
    'paciente.persona.nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'quiropractico.persona.nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    fecha_cita: { value: null, matchMode: FilterMatchMode.DATE_IS },
    'tipo_paciente.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    'estado.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}

initFilters()
const resetFilters = () => initFilters()

const citaSelected = ref({})

const bCitaView = ref(false)
const bCitaEdit = ref(false)
const bCitaDelete = ref(false)

const deleteDialog = ref()
const sendWhatsappDialog = ref()

const cargarSedes = async () => {
  try {
    const response = await getSedes();
    sedesSelect.value = response.map(sede => ({
      label: sede.nombre,
      value: sede.id
    }))
    sedeSelected.value = id_sede.value ? sedesSelect.value[id_sede.value - 1].label : null
    isSedeLoading.value = false
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo las sedes',
      life: 3000
    })
  }
}

const cargarEstadoCita = async () => {
  try {
    const response = await getCitaEstados()
    estadoCitaSelect.value = response.map(estado => ({
      label: estado.nombre,
      value: estado.id
    }))
    isEstadoCitaLoading.value = false
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo los estados de cita',
      life: 3000
    })
  }
}

const cargarEstadoPaciente = async () => {
  try {
    const response = await getPacienteEstados();
    estadoPacienteSelect.value = response.map(estado => ({
      label: estado.nombre,
      value: estado.id
    }))
    isEstadoPacienteLoading.value = false
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo los estados de pacientes',
      life: 3000
    })
  }
}

const cargarCitas = async () => {
  isCitasLoading.value = true
  try {
    const response = await getCitas()
    citasTable.value = response.map(cita => ({
      ...cita,
      fecha_cita: new Date(cita.fecha_cita + 'T00:00:00'),
      paciente: {
        ...cita.paciente,
        persona: {
          ...cita.paciente.persona,
          nombreCompleto: `${cita.paciente.persona.apellido} ${cita.paciente.persona.nombre}`
        }
      },
      quiropractico: {
        ...cita.quiropractico,
        persona: {
          ...cita.quiropractico.persona,
          nombreCompleto: `${cita.quiropractico.persona.apellido} ${cita.quiropractico.persona.nombre}`
        }
      },
      detalle_horario: {
        ...cita.detalle_horario,
        horarioCompleto: `${cita.detalle_horario.hora_inicio} - ${cita.detalle_horario.hora_fin}`
      }
    }))
    isCitasLoading.value = false
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo las citas',
      life: 3000
    })
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const updateCitaSelectedInfo = (cita) => {
  citaSelected.value = {
    id: cita.id,
    id_sede: cita.id_sede,
    estado: cita.estado.id,
    paciente: {
      id: cita.paciente.id,
      estado: cita.tipo_paciente.id,
      nombreCompleto: cita.paciente.persona.nombreCompleto,
      numero: cita.paciente.persona.telefono,
    },
    quiropractico: {
      id: cita.quiropractico.id,
      nombreCompleto: cita.quiropractico.persona.nombreCompleto
    },
    fecha_cita: cita.fecha_cita,
    horario: cita.detalle_horario.id,
    observaciones: cita.observaciones,
    sede: {
      nombre: cita.sede.nombre
    }
  }
}

const verCita = (cita) => {
  updateCitaSelectedInfo(cita)
  bCitaView.value = true
}

const editCita = async (cita) => {

  // Cargar detalles horarios

  try {
    isCitaUpdateLoading.value = true
    updateCitaSelectedInfo(cita)
    bCitaView.value = true
    const response = await getHorariosDisponibles(
      cita.fecha_cita,
      cita.quiropractico.id,
      new Date(cita.fecha_cita).getDay(),
      cita.detalle_horario.id
    )
    isCitaUpdateLoading.value = false
    horariosSelect.value = response.map(e => ({
      label: `${e.hora_inicio} - ${e.hora_fin}`,
      value: e.id
    }))
    console.log('horarios', horariosSelect.value, citaSelected.value.horario)

    bCitaEdit.value = true
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo los horarios disponibles',
      life: 3000
    })
  }


}

const cancelEditCita = () => {
  citaSelected.value = {}
  bCitaEdit.value = false
  bCitaView.value = false
}

const saveCita = async () => {
  isCitaUpdateLoading.value = true

  try {
    const post = {
      id_paciente: citaSelected.value.paciente.id,
      id_quiropractico: citaSelected.value.quiropractico.id,
      id_detalle_horario: citaSelected.value.horario,
      id_sede: citaSelected.value.id_sede,
      fecha_cita: citaSelected.value.fecha_cita.toISOString().split('T')[0],
      estado: citaSelected.value.estado,
      tipo_paciente: citaSelected.value.paciente.estado,
      observaciones: citaSelected.value.observaciones
    }
    const response = await updateCita(citaSelected.value.id, post)
    await cargarCitas()
    isCitaUpdateLoading.value = false
    cancelEditCita()
    toast.add({
      severity: 'success',
      summary: 'La cita ha sido actualizada con exito',
      life: 5000
    })
    if (isLinkWhatsappActive.value)
      sendWhatsappDialog.value.showDialog()
  }
  catch (error) {
    isCitaUpdateLoading.value = false
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error actualizando la cita',
      life: 3000
    })
  }
}


const onShowDialog = (id) => {
  citaSelected.value = { id }
  deleteDialog.value.showDialog()
}

const sendWhatsappMessage = () => {
  const telefono = citaSelected.value.paciente.numero.replace(/\D/g, ''); // Eliminar caracteres no numéricos

  // Podríamos tomar datos como la fecha y hora de la cita, y el nombre completo del paciente
  const paciente = citaSelected.value.paciente.nombreCompleto
  const nomPaciente = paciente.label || 'Estimado/a';
  const fecha = citaSelected.value.fecha_cita ? formatDate(citaSelected.value.fecha_cita) : 'de la fecha programada';

  const horarioSelecciodo = citaSelected.value.horario;
  const hora = horarioSelecciodo ? horarioSelecciodo.label : 'seleccionado';

  const sedeSeleccionada = citaSelected.value.sede.nombre;
  const nomSede = sedeSeleccionada ? sedeSeleccionada : 'consultada';

  const mensaje =
    `¡Hola, ${nomPaciente}!\n\n` +
    `Nos complace informarte que tu cita ha sido programada con éxito en la **${nomSede}**.\n\n` +
    `Te esperamos el día **${fecha}** para brindarte la mejor atención quiropráctica.\n\n` +
    `Si tienes alguna duda o necesitas reprogramar tu cita, ¡no dudes en avisarnos!`;

  // Generar el enlace de WhatsApp
  const enlace = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  window.open(enlace, '_blank');
}

const deleteCitaFn = async () => {
  isCitasLoading.value = true
  try {
    await deleteCita(citaSelected.value.id)
    await cargarCitas()
    isCitasLoading.value = false
    toast.add({
      severity: 'success',
      summary: 'La cita ha sido eliminada con exito',
      life: 5000
    })
  }
  catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error actualizando la cita',
      life: 3000
    })
  }
}

// watch([citaSelected], () => {
//   console.log('cita selected', citaSelected.value)
// })

onMounted(() => {
  cargarSedes()
  cargarEstadoCita()
  cargarEstadoPaciente()
  cargarCitas()
})

</script>
<template>
  <div class="card">
    <p class="text-2xl font-bold text-secondary">Todas las citas</p>
    <DataTable v-model:filters="filters" :value="citasTable" removable-sort table-style="min-width: 50rem"
      :loading="isCitasLoading" filter-display="row" data-key="id" paginator show-gridlines :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas">

      <!-- Header -->
      <template #header>
        <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
      </template>

      <!-- Loading Message -->
      <template #loading class="relative">
        <Preloader is-transparent></Preloader>
      </template>

      <!-- ID -->
      <Column field="id" header="#" sortable style="min-width: 3rem;"></Column>

      <!-- Sede -->
      <Column filterField="sede.nombre" field="sede.nombre" header="Sede" :show-filter-menu="false" sortable
        style="min-width: 8rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-if="id_sede != null" v-model="filterModel.value" disabled></InputText>
          <Select v-else v-model="filterModel.value" @change="filterCallback()" :options="sedesSelect"
            option-label="label" option-value="label" placeholder="Selecciona sede"></Select>
        </template>
      </Column>

      <!-- Paciente -->
      <Column field="paciente.persona.nombreCompleto" header="Paciente" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por paciente" />
        </template>
      </Column>

      <!-- Quiropractico -->
      <Column field="quiropractico.persona.nombreCompleto" header="Quiropractico" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por quiropractico" />
        </template>
      </Column>

      <!-- Fecha cita -->
      <Column field="fecha_cita" header="Fecha" :show-filter-menu="false" sortable style="min-width: 15rem;">
        <template #body="citaItem">
          {{ formatDate(citaItem.data.fecha_cita) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model="filterModel.value" :manual-input="false" @value-change="filterCallback()"
            placeholder="Filtrar por fecha">
          </DatePicker>
        </template>
      </Column>

      <!-- Estado Paciente -->
      <Column field="tipo_paciente.nombre" header="Estado Paciente" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model="filterModel.value" @change="filterCallback()" option-label="label" option-value="label"
            :options="estadoPacienteSelect" placeholder="Filtrar por estado paciente"></Select>
        </template>
      </Column>

      <!-- Estado Cita -->
      <Column field="estado.nombre" header="Estado Cita" :show-filter-menu="false" sortable style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model="filterModel.value" @change="filterCallback()" option-label="label" option-value="label"
            :options="estadoCitaSelect" placeholder="Filtrar por estado cita"></Select>
        </template>
      </Column>

      <!-- Acciones -->
      <Column :exportable="false" style="min-width: 12rem">
        <template #body="citaItem">
          <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2"
            @click="verCita(citaItem.data)"></Button>
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCita(citaItem.data)"></Button>
          <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2"
            @click="onShowDialog(citaItem.data.id)"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog v-model:visible="bCitaView" :show-header="false" :modal="true" :draggable="false" :closable="!bCitaEdit"
    class="w-4/5 lg:w-[650px] relative overflow-hidden">
    <Preloader v-if="isCitaUpdateLoading"></Preloader>
    <div class="flex flex-col gap-6 pt-5">
      <p class="text-2xl font-bold m-0">Informacion de paciente</p>
      <div>
        <label for="nombre_paciente" class="block font-bold mb-3">Nombre de paciente</label>
        <InputText id="nombre_paciente" v-model="citaSelected.paciente.nombreCompleto" fluid disabled>
        </InputText>
      </div>
      <div>
        <label for="estado_paciente" class="block font-bold mb-3">Estado de paciente</label>
        <Select id="estado_paciente" fluid :disabled="!bCitaEdit" :options="estadoPacienteSelect"
          v-model:model-value="citaSelected.paciente.estado" option-label="label" option-value="value"></Select>
      </div>
      <div>
        <label for="numero_paciente" class="block font-bold mb-3">Numero</label>
        <div class="grid grid-cols-4 gap-4 items-center">
          <InputText disabled id="numero_paciente" class="col-span-4 md:col-span-3"
            :class="{ 'md:col-span-4': !bCitaEdit }" v-model:model-value="citaSelected.paciente.numero"></InputText>
          <div v-if="bCitaEdit" class="col-span-4 md:col-span-1">
            <Checkbox binary input-id="linkwsp" class="mr-3" v-model:model-value="isLinkWhatsappActive">
            </Checkbox>
            <label for="linkwsp">Notificar WhatsApp</label>
          </div>
        </div>
      </div>
      <hr class="m-0">
      <p class="text-2xl font-bold m-0">Informacion de cita</p>
      <div>
        <Button icon="pi pi-eye" severity="info" outlined label="Ir a whatsapp" @click="sendWhatsappMessage"></Button>
      </div>
      <div>
        <label for="estado_cita" class="block font-bold mb-3">Estado de cita</label>
        <Select id="estado_cita" fluid :disabled="!bCitaEdit" :options="estadoCitaSelect"
          v-model:model-value="citaSelected.estado" option-label="label" option-value="value"></Select>
      </div>
      <div>
        <label for="nombre_quiropractico" class="block font-bold mb-3">Atendido por quiropractico</label>
        <InputText id="nombre_quiropractico" v-model="citaSelected.quiropractico.nombreCompleto" fluid disabled>
        </InputText>
      </div>

      <div class="grid grid-cols-2 gap-5">
        <div class="col-span-2">
          <label for="fecha_cita" class="block font-bold mb-3">Fecha</label>
          <DatePicker id="fecha_cita" fluid :disabled="!bCitaEdit" v-model:model-value="citaSelected.fecha_cita">
          </DatePicker>
        </div>
        <!-- <div class="col-span-2 md:col-span-1">
          <label for="horario" class="block font-bold mb-3">Horario</label>
          <Select id="horario" :disabled="!bCitaEdit" fluid v-model:model-value="citaSelected.horario"
            :options="horariosSelect" option-label="label" option-value="value"></Select>
        </div> -->
      </div>

      <div>
        <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
        <Textarea id="observaciones" v-model="citaSelected.observaciones" fluid :disabled="!bCitaEdit">
      </Textarea>
      </div>


      <div v-if="bCitaEdit" class="grid grid-cols-2 gap-5">
        <Button class="col-span-2 md:col-span-1" label="Cancelar" icon="pi pi-times" outlined
          @click="cancelEditCita()"></Button>
        <Button class="col-span-2 md:col-span-1" label="Guardar" icon="pi pi-check" @click="saveCita()"></Button>
      </div>
      <div v-else>
        <Button fluid @click="bCitaView = false" label="Cerrar" outlined></Button>
      </div>
    </div>
  </Dialog>
  <YesNoDialog ref="sendWhatsappDialog" title="¿Desea notificar al paciente via Whatsapp?"
    v-on:affirmation="sendWhatsappMessage"></YesNoDialog>
  <YesNoDialog ref="deleteDialog" title="¿Deseas eliminar esta cita?" v-on:affirmation="deleteCitaFn"></YesNoDialog>
</template>