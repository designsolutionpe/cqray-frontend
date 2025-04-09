<script setup>
import Preloader from '@/components/Preloader.vue'
import YesNoDialog from '@/components/YesNoDialog.vue'
import { deleteCita, getCitaEstados, getCitas, updateCita } from '@/service/gestion/CitaService'
import { getPacienteEstados } from '@/service/gestion/PacienteService'
import { getSedes } from '@/service/mantenimiento/SedeService'
import { formatDate } from '@/utils/Util'
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
const id_usuario = computed(() => store.getters.id)

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
const aTipoDocumento = ref([
  { label: "DNI" },
  { label: "Carnet de extranjeria" },
  { label: "RUC" },
  { label: "Otro" },
])

const sedeSelected = ref(null)
const estadoCitaSelected = ref(null)
const estadoPacienteSelected = ref(null)

const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sede.nombre': { value: sedeSelected, matchMode: FilterMatchMode.EQUALS },
    'paciente.persona.nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'paciente.persona.tipo_documento': { value: null, matchMode: FilterMatchMode.EQUALS },
    'paciente.persona.numero_documento': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'paciente.historia_clinica': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'quiropractico.persona.nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    fecha_cita: { value: null, matchMode: FilterMatchMode.DATE_IS },
    hora_cita: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'paciente.persona.edad': { value: null, matchMode: FilterMatchMode.CONTAINS },
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
      hora_cita: cita.hora_cita ? new Date(cita.fecha_cita + 'T' + cita.hora_cita).toLocaleTimeString('es-PE', { hour12: true }) : null,
      paciente: {
        ...cita.paciente,
        persona: {
          ...cita.paciente.persona,
          nombreCompleto: `${cita.paciente.persona.apellido} ${cita.paciente.persona.nombre}`,
          edad: new Date().getYear() - new Date(cita.paciente.persona.fecha_nacimiento + 'T00:00:00').getYear()
        }
      }
    }))
    isCitasLoading.value = false
  }
  catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo las citas',
      life: 3000
    })
  }
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
      edad: new Date().getYear() - new Date(cita.paciente.persona.fecha_nacimiento + 'T00:00:00').getYear()
    },
    quiropractico: `Quiropractico - ${cita.sede.nombre.split(' ')[1]}`,
    fecha_cita: cita.fecha_cita,
    hora_cita: cita.hora_cita,
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
    updateCitaSelectedInfo(cita)
    bCitaView.value = true
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
  bCitaEdit.value = false
  bCitaView.value = false
}

const saveCita = async () => {
  isCitaUpdateLoading.value = true

  try {
    const post = {
      id_paciente: citaSelected.value.paciente.id,
      id_sede: citaSelected.value.id_sede,
      id_usuario: id_usuario.value,
      fecha_cita: citaSelected.value.fecha_cita.toISOString().split('T')[0],
      hora_cita: citaSelected.value.hora_cita.toTimeString().slice(0, 5),
      estado: citaSelected.value.estado,
      tipo_paciente: citaSelected.value.paciente.estado,
      observaciones: citaSelected.value.observaciones
    }
    const response = await updateCita(citaSelected.value.id, post)
    if (isLinkWhatsappActive.value)
      sendWhatsappDialog.value.showDialog()
    await cargarCitas()
    isCitaUpdateLoading.value = false
    toast.add({
      severity: 'success',
      summary: 'La cita ha sido actualizada con exito',
      life: 5000
    })
    cancelEditCita()
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
  console.log('test', citaSelected.value)
  const info = citaSelected.value
  const telefono = info.paciente.numero.replace(/\D/g, ''); // Eliminar caracteres no numéricos

  // Podríamos tomar datos como la fecha y hora de la cita, y el nombre completo del paciente
  const paciente = info.paciente.nombreCompleto
  const nomPaciente = paciente || 'Estimado/a';

  const fecha = info.fecha_cita ? formatDate(info.fecha_cita) : 'la fecha programada';
  console.log('VERIFICAR', info.hora_cita)
  const hora = typeof info.hora_cita != 'string' ? info.hora_cita.toLocaleTimeString('es-PE', { hour12: true }) : info.hora_cita

  // const horarioSelecciodo = citaSelected.value.horario;
  // const hora = horarioSelecciodo ? horarioSelecciodo.label : 'seleccionado';

  const sedeSeleccionada = info.sede.nombre;
  const nomSede = sedeSeleccionada ? sedeSeleccionada : 'sede consultada';

  const mensaje =
    `¡${nomPaciente}!\n\n` +
    `Esperemos estes teniendo un buen dia, te recordamos que tienes una cita *${fecha} ${hora}* en la *${nomSede}*.\n\n` +
    `Para brindarte la mejor atención quiropráctica.\n\n` +
    `Por favor confirme su asistencia por este medio, de igual forma si tiene alguna duda o requiere reprogramar no dude en avisarnos.`;

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
  <div class="card relative overflow-hidden">
    <Preloader v-if="isCitasLoading"></Preloader>
    <p class="text-2xl font-bold text-secondary">Todas las citas</p>
    <DataTable v-model:filters="filters" :value="citasTable" removable-sort table-style="min-width: 50rem"
      filter-display="row" data-key="id" paginator show-gridlines :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas"
      :global-filter-fields="['paciente.persona.tipo_documento', 'paciente.persona.numero_documento', 'sede.nombre', 'paciente.persona.nombreCompleto', 'paciente.persona.edad', 'paciente.historia_clinica']">

      <!-- Header -->
      <template #header>
        <div class="flex justify-between">
          <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
          <IconField>
            <InputIcon>
              <i class="pi pi-search"></i>
            </InputIcon>
            <InputText v-model:model-value="filters['global'].value" placeholder="Filtro global"></InputText>
          </IconField>
        </div>
      </template>

      <!-- ID -->
      <!-- <Column field="id" header="#" sortable style="min-width: 3rem;"></Column> -->

      <!-- Sede -->
      <Column filterField="sede.nombre" field="sede.nombre" header="Sede" :show-filter-menu="false" sortable
        style="min-width: 8rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-if="id_sede != null" v-model="filterModel.value" disabled></InputText>
          <Select v-else v-model="filterModel.value" @change="filterCallback()" :options="sedesSelect"
            option-label="label" option-value="label" placeholder="Selecciona sede"></Select>
        </template>
      </Column>

      <!-- DNI -->
      <Column field="paciente.persona.tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model="filterModel.value" @change="filterCallback()" option-label="label" option-value="label"
            :options="aTipoDocumento" placeholder="Filtrar por Tipo Documento"></Select>
        </template>
      </Column>

      <!-- Numero Documento -->
      <Column field="paciente.persona.numero_documento" header="Numero Documento" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por documento" />
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


      <!-- Historial Cita -->
      <Column field="paciente.historia_clinica" header="Historia Clinica" :show-filter-menu="false" sortable
        style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
            placeholder="Filtrar por historia" />
        </template>
      </Column>

      <!-- Fecha cita -->
      <Column field="fecha_cita" header="Fecha Cita" :show-filter-menu="false" sortable style="min-width: 15rem;">
        <template #body="citaItem">
          {{ formatDate(citaItem.data.fecha_cita) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model="filterModel.value" :manual-input="false" @value-change="filterCallback()"
            placeholder="Filtrar por fecha">
          </DatePicker>
        </template>
      </Column>

      <!-- Hora Cita -->
      <Column field="hora_cita" header="Fecha Hora" :show-filter-menu="false" sortable style="min-width: 10rem;">
        <template #body="citaItem">
          <div>{{ citaItem.data.hora_cita }}</div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Filtrar por hora" />
        </template>
      </Column>

      <!-- Edad -->
      <Column field="paciente.persona.edad" header="Edad" :show-filter-menu="false" sortable style="min-width: 10rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Filtrar por edad" />
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
        <label for="nombre_quiropractico" class="block font-bold mb-3">Atendido por</label>
        <InputText id="nombre_quiropractico" v-model="citaSelected.quiropractico" fluid disabled>
        </InputText>
      </div>

      <div class="grid grid-cols-2 gap-5">
        <div class="col-span-2 md:col-span-1">
          <label for="fecha_cita" class="block font-bold mb-3">Fecha</label>
          <DatePicker id="fecha_cita" fluid :disabled="!bCitaEdit" v-model:model-value="citaSelected.fecha_cita"
            date-format="dd/mm/yy">
          </DatePicker>
        </div>
        <div class="col-span-2 md:col-span-1">
          <label for="hora_cita" class="block font-bold mb-3">Hora</label>
          <DatePicker id="hora_cita" class="w-full" fluid :disabled="!bCitaEdit"
            v-model:model-value="citaSelected.hora_cita" time-only hour-format="12">
          </DatePicker>
        </div>
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