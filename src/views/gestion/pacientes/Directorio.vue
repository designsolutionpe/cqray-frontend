<script setup>
import Preloader from '@/components/Preloader.vue';
import { getPaciente } from '@/service/gestion/PacienteService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
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
    nombre: null,
  },
  estado: {
    nombre: null
  },
  persona: {
    numero_documento: null
  }
})

const cargarPaciente = async () => {
  isPageLoading.value = true
  try {
    const response = await getPaciente(id_paciente.value, cancelToken.value.token)
    if (response) {
      console.log('PACIENTE', response)
      oPacienteInfo.value = response
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

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex gap-3">
      <div class="flex flex-col gap-4 justify-end">
        <div class="flex flex-col gap-4">
          <p class="text-2xl font-bold text-secondary m-0">Directorio</p>
          <router-link to="/gestion/citas/agregar">
            <Button icon="pi pi-plus" label="Agregar cita" class="w-full"></Button>
          </router-link>
          <router-link to="/gestion/pacientes/agregar">
            <Button icon="pi pi-plus" label="Agregar paciente" class="w-full"></Button>
          </router-link>
        </div>
        <div class="card border-2 !rounded-xl flex flex-col gap-4">
          <p class="text-xl font-bold text-center m-0">ID: {{ oPacienteInfo.persona.numero_documento }}</p>
          <div>
            <p class="text-xl font-bold text-center mb-2">Estado paciente:</p>
            <p class="bg-green-600 text-white font-bold rounded-full text-center px-4 py-2 text-lg">Paciente {{
              oPacienteInfo.estado.nombre }}
            </p>
          </div>
          <div>
            <p class="text-xl font-bold text-center mb-2">Paquete actual:</p>
            <p class="bg-red-600 text-white text-center font-bold rounded-full px-4 py-2 text-lg">000 / 000</p>
          </div>
          <div>
            <p class="text-xl font-bold text-center mb-2">Historia Clinica</p>
            <p class="text-center font-medium text-lg">{{ oPacienteInfo.historia_clinica || '<sin informacion>' }}</p>
          </div>
        </div>
      </div>
      <div class="card border-2 !rounded-3xl flex-auto !p-3">
        <Tabs value="0">
          <TabList>
            <Tab value="0">Datos Personales</Tab>
            <Tab value="1" disabled>Mantenimiento</Tab>
            <Tab value="2" disabled>Mantenimiento</Tab>
            <Tab value="3" disabled>Mantenimiento</Tab>
            <Tab value="4" disabled>Mantenimiento</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <!-- <DataTable :value="[oPacienteInfo]" removable-sort table-style="min-width: 50rem" data-key="id"
                show-gridlines>

              <Column field="sede.nombre" header="Creado en" :show-filter-menu="false" sortable style="min-width: 8rem">
                <template #body="pacienteItem">
                  {{ pacienteItem.data.sede.nombre.toUpperCase() }}
                </template>
</Column>

<Column field="persona.tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable
  style="min-width: 8rem">
  <template #body="pacienteItem">
                  {{ pacienteItem.data.persona.tipo_documento.toUpperCase() }}
                </template>
</Column>

<Column field="persona.numero_documento" header="Numero Documento" :show-filter-menu="false" sortable
  style="min-width: 10rem;"></Column>

<Column field="persona.apellido" header="Apellido" :show-filter-menu="false" sortable style="min-width: 10rem;">
  <template #body="pacienteItem">
                  {{ pacienteItem.data.persona.apellido.toUpperCase() }}
                </template>
</Column>

<Column field="persona.nombre" header="Nombre" :show-filter-menu="false" sortable style="min-width: 10rem;">
  <template #body="pacienteItem">
                  {{ pacienteItem.data.persona.nombre.toUpperCase() }}
                </template>
</Column>

<Column field="persona.genero" header="Genero" :show-filter-menu="false" sortable style="min-width: 8rem">
  <template #body="pacienteItem">
                  {{ pacienteItem.data.persona.genero.toUpperCase() }}
                </template>
</Column>

<Column field="persona.fecha_nacimiento" header="Fecha Nacimiento" :show-filter-menu="false" sortable
  style="min-width: 15rem;">
  <template #body="pacienteItem">
                  {{ formatDate(pacienteItem.data.persona.fecha_nacimiento) }}
                </template>
</Column>

<Column field="estado.nombre" header="Estado" :show-filter-menu="false" sortable style="min-width: 8rem">
  <template #body="pacienteItem">
                  {{ pacienteItem.data.estado.nombre.toUpperCase() }}
                </template>
</Column>

<Column field="historia_clinica" header="Historia Clinica" :show-filter-menu="false" sortable style="min-width: 10rem;">
</Column>

<Column :exportable="false" style="min-width: 15rem">
  <template #body="pacienteItem">
                  <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="null"></Button>
                  <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="null"></Button>
                </template>
</Column>

</DataTable> -->
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>

    </div>
  </div>
</template>