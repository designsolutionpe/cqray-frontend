<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { getPacienteEstados } from '@/service/gestion/PacienteService';
import { createArticuloServicio, deleteArticuloServicio, getArticulosServicios, getCategorias, getMedidas, updateArticuloServicio } from '@/service/mantenimiento/ArticulosService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex'

// Global
const aServicios = ref([])
const aSedes = ref([])
const aCategorias = ref([])
const aMedidas = ref([])
const aEstadoPaciente = ref([])

const store = useStore()
const id_sede = computed(()=>store.getters.id_sede)

// Filters

const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'sede.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    'categoria.nombre': { value: null, matchMode: FilterMatchMode.EQUALS },
    precio_venta: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  }
}

initFilters()

const resetFilters = () => initFilters()

// Loading state
const isPageLoading = ref(true)
const isServiciosLoading = ref(true)
const isSedesLoading = ref(true)
const isCategoriasLoading = ref(true)
const isMedidasLoading = ref(true)
const isEstadoPacienteLoading = ref(true)

watch([
  isServiciosLoading,
  isSedesLoading,
  isCategoriasLoading,
  isMedidasLoading,
  isEstadoPacienteLoading
], (values) => {
  const [servicios, sedes, categorias, medidas, estado_paciente] = values

  isPageLoading.value = (servicios || sedes || categorias || medidas || estado_paciente)
})

// Peticiones

const cancelToken = ref()
const toast = useToast()

const cargarServicios = async () => {
  isServiciosLoading.value = true
  try {
    const response = await getArticulosServicios(cancelToken.value.token)
    if (response) {
      console.log('servicios', response)
      aServicios.value = response.filter(s => s.tipo_articulo == 2)
    }
    isServiciosLoading.value = false
  }
  catch (error) {
    isServiciosLoading.value = false
    handleServerError(error, 'Obtener Servicios', toast)
  }
}

const cargarSedes = async () => {
  isSedesLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      console.log('sedes', response)
      aSedes.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
      const sede = id_sede.value ? aSedes.value.find( s => s.value == id_sede.value ).label : null
      console.log("sede",sede)
      filters.value["sede.nombre"] = { value: sede , matchMode: FilterMatchMode.CONTAINS }
      console.log('sede filter',filters.value)
    }
    isSedesLoading.value = false
  }
  catch (error) {
    isSedesLoading.value = false
    handleServerError(error, 'Obtener sedes', toast)
  }
}

const cargarCategorias = async () => {
  isCategoriasLoading.value = true
  try {
    const response = await getCategorias(cancelToken.value.token)
    if (response) {
      console.log('categorias', response)
      aCategorias.value = response.map(c => ({
        label: c.nombre,
        value: c.id
      }))
    }
    isCategoriasLoading.value = false
  }
  catch (error) {
    isCategoriasLoading.value = false
    handleServerError(error, 'Obtener categorias', toast)
  }
}

const cargarMedidas = async () => {
  isMedidasLoading.value = true
  try {
    const response = await getMedidas(cancelToken.value.token)
    if (response) {
      console.log('medidas', response)
      aMedidas.value = response.map(m => ({
        label: m.nombre,
        value: m.id
      }))
    }
    isMedidasLoading.value = false
  }
  catch (error) {
    isMedidasLoading.value = false
    handleServerError(error, 'Obtener medidas', toast)
  }
}

const cargarEstadoPaciente = async () => {
  isEstadoPacienteLoading.value = true
  try {
    const response = await getPacienteEstados(cancelToken.value.token)
    if (response) {
      console.log('estado pacientes', response)
      aEstadoPaciente.value = response.map(e => ({
        label: e.nombre,
        value: e.id
      }))
    }
    isEstadoPacienteLoading.value = false
  }
  catch (error) {
    isEstadoPacienteLoading.value = false
    handleServerError(error, 'Obtener estados', toast)
  }
}

const cargarTodo = () => {
  cargarServicios()
  cargarSedes()
  cargarCategorias()
  cargarMedidas()
  cargarEstadoPaciente()
}

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarTodo()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

// Dialog - Editar servicio

const bEditView = ref(false)
const isUpdatingServicio = ref(false)

const oServicioData = ref()

const aTipoArticuloSelect = ref([{ label: 'Servicio', value: 2 }])

const nSedeSelected = ref()
const nCategoriaSelected = ref()
const nTipoArticulo = ref()
const nMedidaSelected = ref()
const nEstadoPacienteSelected = ref()
const nCantidad = ref()
const sNombreInput = ref()
const sDetalleInput = ref()
const sPrecioVenta = ref()

watch(
  [
    nSedeSelected,
    nCategoriaSelected,
    nTipoArticulo,
    nMedidaSelected,
    nEstadoPacienteSelected,
    nCantidad,
    sNombreInput,
    sDetalleInput,
    sPrecioVenta
  ],
  (values) => {
    const [
      id_sede,
      id_categoria,
      tipo_articulo,
      id_unidad_medida,
      id_estado_paciente,
      cantidad,
      nombre,
      detalle,
      precio_venta
    ] = values

    oServicioData.value = {
      ...oServicioData.value,
      id_sede,
      id_categoria,
      tipo_articulo,
      id_unidad_medida,
      id_estado_paciente,
      cantidad,
      nombre,
      detalle,
      precio_venta
    }
  })

const updateServicioData = (data) => {
  console.log('updating servicio data', data)
  oServicioData.value = data
  nSedeSelected.value = data.id_sede
  nCategoriaSelected.value = data.id_categoria
  nTipoArticulo.value = data.tipo_articulo
  nMedidaSelected.value = data.id_unidad_medida
  nEstadoPacienteSelected.value = data.id_estado_paciente
  nCantidad.value = data.cantidad
  sNombreInput.value = data.nombre
  sDetalleInput.value = data.detalle
  sPrecioVenta.value = data.precio_venta
}

const onOpenEditDialog = (d) => {
  updateServicioData(d)
  bCrearView.value = false
  bEditView.value = true
}

const onEditServicio = async () => {
  isUpdatingServicio.value = true
  try {
    console.log('enviar', oServicioData.value)
    const response = await updateArticuloServicio(oServicioData.value.id, oServicioData.value)
    isUpdatingServicio.value = false
    bEditView.value = false
    cargarTodo()
    toast.add({
      severity: 'success',
      summary: 'Se ha actualizado el servicio exitosamente',
      life: 5000
    })
  }
  catch (error) {
    isUpdatingServicio.value = false
    handleServerError(error, 'Actualizando servicio', toast)
  }
}

// Dialog - Eliminar Servicio

const refDeleteDialog = ref()

const onOpenDeleteDialog = (d) => {
  updateServicioData(d)
  refDeleteDialog.value.showDialog()
}

const onDeleteServicio = async () => {
  try {
    const response = await deleteArticuloServicio(oServicioData.value.id)
    cargarTodo()
    toast.add({
      severity: 'success',
      summary: 'Se ha eliminado el servicio exitosamente',
      life: 5000
    })
  }
  catch (error) {
    handleServerError(error, 'Actualizando servicio', toast)
  }
}

// Dialog - Agregar servicio

const bCrearView = ref(false)
const isCreateServicioLoading = ref(false)

const onOpenCrearDialog = () => {
  nSedeSelected.value = null
  nCategoriaSelected.value = null
  nTipoArticulo.value = null
  nMedidaSelected.value = null
  nEstadoPacienteSelected.value = null
  nCantidad.value = null
  sNombreInput.value = null
  sDetalleInput.value = null
  sPrecioVenta.value = null

  bCrearView.value = true
  bEditView.value = true
}

const onCreateServicio = async () => {
  isCreateServicioLoading.value = true
  try {
    console.log('por crear', oServicioData.value)
    const response = await createArticuloServicio(oServicioData.value)
    console.log('creaddo', response)
    isCreateServicioLoading.value = false
    bCrearView.value = false
    bEditView.value = false
    cargarTodo()
    toast.add({
      severity: 'success',
      summary: 'Se ha creado el servicio exitosamente',
      life: 5000
    })
  }
  catch (error) {
    isCreateServicioLoading.value = false
    handleServerError(error, 'Crear servicio', toast)
  }
}

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="refDeleteDialog" title="¿Desea eliminar este servicio?" v-on:affirmation="onDeleteServicio">
    </YesNoDialog>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary m-0">Servicios</p>
      <DataTable :value="aServicios" removable-sort table-style="min-width: 50rem" data-key="id" show-gridlines
        v-model:filters="filters" filter-display="row" :rows="10" paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} servicios">

        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-2" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-2" icon="pi pi-plus"
              label="Crear servicio" @click="onOpenCrearDialog"></Button>
            <IconField class="col-span-12 sm:col-span-4 lg:col-span-6 xl:col-span-8 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>

        <Column field="nombre" header="Nombre Servicio" sortable :show-filter-menu="false" style="min-width: 15rem">
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por nombre" class="w-full"></InputText>
          </template>
        </Column>

        <Column field="sede.nombre" header="Sede" sortable :show-filter-menu="false" style="min-width: 15rem;">
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aSedes"
              option-label="label" option-value="label" placeholder="Filtrar por sede" class="w-full"></Select>
          </template>
        </Column>

        <Column field="categoria.nombre" header="Categoria" sortable :show-filter-menu="false"
          style="min-width: 15rem;">
          <template #filter="{ filterModel, filterCallback }">
            <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aCategorias"
              option-label="label" option-value="label" placeholder="Filtrar por categoria" class="w-full"></Select>
          </template>
        </Column>

        <Column field="precio_venta" header="Precio Venta" sortable :show-filter-menu="false" style="min-width: 15rem">
          <template #body="precio">
            {{ parseFloat(precio.data.precio_venta).toFixed(2) }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model:model-value="filterModel.value" @input="filterCallback()"
              placeholder="Filtrar por precio" class="w-full"></InputText>
          </template>
        </Column>

        <Column :exportable="false" style="min-width: 8rem">
          <template #body="servicioItem">
            <div class="flex gap-3">
              <Button icon="pi pi-pencil" outlined rounded @click="onOpenEditDialog(servicioItem.data)"></Button>
              <Button icon="pi pi-trash" outlined rounded severity="danger"
                @click="onOpenDeleteDialog(servicioItem.data)"></Button>
            </div>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="bEditView" modal :draggable="false"
    :header="bCrearView ? 'Nuevo servicio' : 'Editar servicio'" class="w-4/5 md:w-[450px] relative overflow-hidden">
    <Preloader v-if="isUpdatingServicio || isCreateServicioLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <div>
        <label for="sede" class="block font-bold mb-3">Sede</label>
        <Select fluid id="sede" v-model:model-value="nSedeSelected" :options="aSedes" option-label="label"
          option-value="value"></Select>
      </div>
      <div>
        <label for="categoria" class="block font-bold mb-3">Categoria</label>
        <Select fluid id="categoria" v-model:model-value="nCategoriaSelected" :options="aCategorias"
          option-label="label" option-value="value"></Select>
      </div>
      <div>
        <label for="estado_paciente" class="block font-bold mb-3">Estado paciente a vincular</label>
        <Select fluid id="estado_paciente" v-model:model-value="nEstadoPacienteSelected" :options="aEstadoPaciente"
          option-label="label" option-value="value"></Select>
      </div>
      <div>
        <label for="tipo" class="block font-bold mb-3">Tipo</label>
        <Select fluid id="tipo" v-model:model-value="nTipoArticulo" :options="aTipoArticuloSelect" option-label="label"
          option-value="value"></Select>
      </div>
      <div>
        <label for="unidad_medida" class="block font-bold mb-3">Unidad Medida</label>
        <Select fluid id="unidad_medida" v-model:model-value="nMedidaSelected" :options="aMedidas" option-label="label"
          option-value="value"></Select>
      </div>
      <div>
        <label for="cantidad" class="block font-bold mb-3">Cantidad</label>
        <InputNumber fluid id="cantidad" :use-grouping="false" v-model:model-value="nCantidad"></InputNumber>
      </div>
      <div>
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText fluid id="nombre" v-model:model-value="sNombreInput" placeholder="Nombre del servicio"></InputText>
      </div>
      <div>
        <label for="detalle" class="block font-bold mb-3">Detalle</label>
        <Textarea fluid id="detalle" v-model:model-value="sDetalleInput" placeholder="Detalle del servicio"
          :auto-resize="true"></Textarea>
      </div>
      <div>
        <label for="precio_venta" class="block font-bold mb-3">Precio Venta</label>
        <InputNumber fluid id="precio_venta" :use-grouping="false" v-model:model-value="sPrecioVenta"
          :min-fraction-digits="2" :max-fraction-digits="2"></InputNumber>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <Button class="col-span-4 md:col-span-2" icon="pi pi-times" label="Cancelar" outlined
          @click="bEditView = false"></Button>
        <Button v-if="!bCrearView" class="col-span-4 md:col-span-2" icon="pi pi-check" label="Actualizar"
          @click="onEditServicio"></Button>
        <Button v-else class="col-span-4 md:col-span-2" icon="pi pi-check" label="Crear servicio"
          @click="onCreateServicio"></Button>
      </div>
    </div>
  </Dialog>
</template>