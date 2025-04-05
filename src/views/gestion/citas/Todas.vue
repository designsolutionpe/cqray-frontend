<script setup>
import { getCitaEstados, getCitas } from '@/service/gestion/CitaService'
import { getPacienteEstados } from '@/service/gestion/PacienteService'
import { getSedes } from '@/service/mantenimiento/SedeService'
import { useToast } from 'primevue'
import { onMounted, ref } from 'vue'

const toast = useToast()

const isPageLoading = ref(true)
const isSedeLoading = ref(true)
const isEstadoCitaLoading = ref(true)
const isEstadoPacienteLoading = ref(true)
const isCitasLoading = ref(true)

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

const todasOption = { label: 'Todas', value: 'string' }

const sedeSelected = ref(0)
const estadoCitaSelected = ref(0)
const estadoPacienteSelected = ref(0)
const fechaFilter = ref(null)

const citaSelected = ref({})

const bCitaView = ref(false)
const bCitaEdit = ref(false)
const bCitaDelete = ref(false)

const cargarSedes = async () => {
  try {
    const response = await getSedes();
    sedesSelect.value = response.map(sede => ({
      label: sede.nombre,
      value: sede.id
    }))
    sedeSelected.value = sedesSelect.value[0]
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
    estadoCitaSelect.value = [
      todasOption,
      ...response.map(estado => ({
        label: estado.nombre,
        value: estado.id
      }))
    ]
    estadoCitaSelected.value = todasOption
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
    estadoPacienteSelect.value = [
      todasOption,
      ...response.map(estado => ({
        label: estado.nombre,
        value: estado.id
      }))
    ]
    estadoPacienteSelected.value = todasOption
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
  try {
    const response = await getCitas()
    console.log('citas', response)
    citasTable.value = response
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

const verCita = (cita) => {
  console.log(cita)
  citaSelected.value = {
    ...cita,
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
  }
  bCitaView.value = true
}

// watch([bCitaView], () => {
//   if (citaSelected)
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
    <p class="text-2xl font-bold text-primary">Todas las citas</p>
    <Panel class="col-span-4 sm:col-span-3" header="Filtros" toggleable collapsed>
      <div class="grid grid-cols-4 gap-4">
        <DatePicker class="col-span-4 md:col-span-2 lg:col-span-1" v-model="fechaFilter" view="month"
          date-format="mm/yy" placeholder="Ingrese fecha"></DatePicker>
        <Select class="col-span-4 md:col-span-2 lg:col-span-1" v-model="sedeSelected" :disabled="isSedeLoading"
          :options="sedesSelect" optionLabel="label" placeholder="Sede"></Select>
        <Select class="col-span-4 md:col-span-2 lg:col-span-1" v-model="estadoCitaSelected"
          :disabled="isEstadoCitaLoading" :options="estadoCitaSelect" optionLabel="label"
          placeholder="Estado cita"></Select>
        <Select class="col-span-4 md:col-span-2 lg:col-span-1" v-model="estadoPacienteSelected"
          :disabled="isEstadoPacienteLoading" :options="estadoPacienteSelect" optionLabel="label"
          placeholder="Estado paciente"></Select>
      </div>
    </Panel>

    <DataTable :value="citasTable" removable-sort table-style="min-width: 50rem" :loading="isCitasLoading">
      <Column field="id" header="#" sortable style="min-width: 3rem;"></Column>
      <Column field="sede.nombre" header="Sede" sortable style="min-width: 8rem;"></Column>
      <Column header="Paciente" sortable style="min-width: 10rem;">
        <template #body="citaItem">
          {{ `${citaItem.data.paciente.persona.apellido} ${citaItem.data.paciente.persona.nombre}` }}
        </template>
      </Column>
      <Column header="Quiropractico" sortable style="min-width: 10rem;">
        <template #body="citaItem">
          {{ `${citaItem.data.quiropractico.persona.apellido} ${citaItem.data.quiropractico.persona.nombre}` }}
        </template>
      </Column>
      <Column field="fecha_cita" header="Fecha" sortable style="min-width: 8rem;"></Column>
      <Column header="Estado Paciente" sortable style="min-width: 10rem;">
        <template #body="citaItem">
          {{ citaItem.data.paciente.estado.nombre }}
        </template>
      </Column>
      <Column header="Estado Cita" sortable style="min-width: 10rem;">
        <template #body="citaItem">
          {{ citaItem.data.estado.nombre }}
        </template>
      </Column>
      <Column :exportable="false" style="min-width: 12rem">
        <template #body="citaItem">
          <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2"
            @click="verCita(citaItem.data)"></Button>
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="null"></Button>
          <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="null"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog v-model:visible="bCitaView" header="Informacion de cita" modal class="w-4/5 lg:w-2/4">
    <div class="flex flex-col gap-6">
      <div>
        <label for="estado_cita" class="block font-bold mb-3">Estado de cita</label>
        <InputText id="estado_cita" v-model="citaSelected.estado.nombre" fluid disabled></InputText>
      </div>
      <div>
        <label for="nombre_paciente" class="block font-bold mb-3">Nombre de paciente</label>
        <InputText id="nombre_paciente" v-model="citaSelected.paciente.persona.nombreCompleto" fluid disabled>
        </InputText>
      </div>
      <div>
        <label for="estado_paciente" class="block font-bold mb-3">Estado de paciente</label>
        <InputText id="estado_paciente" v-model="citaSelected.paciente.estado.nombre" fluid disabled></InputText>
      </div>
      <div>
        <label for="nombre_quiropractico" class="block font-bold mb-3">Atendido por quiropractico</label>
        <InputText id="nombre_quiropractico" v-model="citaSelected.quiropractico.persona.nombre" fluid disabled>
        </InputText>
      </div>
      <div>
        <label for="horario" class="block font-bold mb-3">Horario</label>
        <InputText id="horario" v-model="citaSelected.detalle_horario.horarioCompleto" fluid disabled>
        </InputText>
      </div>

      <div>
        <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
        <Textarea id="observaciones" v-model="citaSelected.observaciones" fluid disabled>
      </Textarea>
      </div>
    </div>
  </Dialog>
</template>