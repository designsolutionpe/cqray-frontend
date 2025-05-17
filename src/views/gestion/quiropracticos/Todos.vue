<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deleteQuiropractico, getQuiropracticos, updateQuiropractico } from '@/service/gestion/QuiropracticoService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { formatDate } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global Data
const toast = useToast()

const store = useStore()

const id_sede = computed(() => store.getters.id_sede)

const oQuiropracticoValues = ref({
  id: null,
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
})

const aQuiropracticos = ref([])
const filters = ref()

const deleteDialog = ref()
const editDialog = ref(false)

const aSedesSelect = ref([])
const nSedeSelected = ref(null)
const isSedeLoading = ref(false)
// Loading state Variables
const isQuiropracticosLoading = ref(true)
const isPageLoading = ref(true)

// Select Data
const aTipoDocumentoSelect = ref([
  { value: 'DNI' },
  { value: 'Carnet de Extranjeria' },
  { value: 'Pasaporte' },
  { value: 'Otro' },
])
const aGeneroSelect = ref([
  { value: 'Masculino' },
  { value: 'Femenino' },
])

// Additional Functions
const handleServerError = (error, info) => {
  console.error(error);
  toast.add({
    severity: 'error',
    summary: 'Hubo un error obteniendo la informacion: ' + info,
    life: 5000
  })
}

const initFilters = () => {
  filters.value = {
    'sede.nombre': { value: nSedeSelected, matchMode: FilterMatchMode.EQUALS },
    'persona.tipo_documento': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.nombre': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.apellido': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'persona.genero': { value: null, matchMode: FilterMatchMode.EQUALS },
    'persona.fecha_nacimiento': { value: null, matchMode: FilterMatchMode.DATE_IS }
  }
}

initFilters()

const resetFilters = () => initFilters()

const updateQuiroSelected = (quiro) => {
  oQuiropracticoValues.value = {
    id: quiro.id,
    // Persona info
    tipo_documento: quiro.persona.tipo_documento,
    numero_documento: quiro.persona.numero_documento,
    nombre: quiro.persona.nombre,
    apellido: quiro.persona.apellido,
    genero: quiro.persona.genero,
    fecha_nacimiento: quiro.persona.fecha_nacimiento,
    direccion: quiro.persona.direccion,
    telefono: quiro.persona.telefono,
    email: quiro.persona.email,
    foto: quiro.persona.foto,
    // Quiropractico info
    id_sede: quiro.id_sede,
    numero_colegiatura: quiro.numero_colegiatura,
    datos_contacto: quiro.datos_contacto,
    estado: quiro.estado
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
    const preselect = aSedesSelect.value.find(s => s.value === parseInt(id_sede.value))
    nSedeSelected.value = preselect ? preselect.label : null
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Sedes')
  }
}

const editQuiro = (quiro) => {
  updateQuiroSelected(quiro)
  editDialog.value = true
  //console.log(quiro)
}

const verQuiropractico = ref(false)
const verQuiro = (quiro) => {
  updateQuiroSelected(quiro)
  verQuiropractico.value = true
  editDialog.value = true
}

const closeVerQuiro = () => {
  verQuiropractico.value = false
  editDialog.value = false
}

const deleteQuiro = (quiro) => {
  updateQuiroSelected(quiro)
  deleteDialog.value.showDialog()
}

// Retrieve Server Data
const cargarQuiropracticos = async () => {
  isQuiropracticosLoading.value = true
  try {
    const response = await getQuiropracticos()
    aQuiropracticos.value = response.map(q => ({
      ...q,
      persona: {
        ...q.persona,
        fecha_nacimiento: new Date(q.persona.fecha_nacimiento)
      }
    }))
    isQuiropracticosLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Quiropracticos')
  }
}

const deleteFn = async () => {
  isPageLoading.value = true
  try {
    const response = await deleteQuiropractico(oQuiropracticoValues.value.id)
    cargarQuiropracticos()
    isPageLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'Eliminar quiropractico')
  }
}

const bImageError = ref(false)
const previewSrc = ref(null)
const selectedFile = ref(null)

function removeImage() {
  oQuiropracticoValues.value.foto = null;
  selectedFile.value = null;
  previewSrc.value = null;
}

function onFileSelect(event) {
  const file = event.files[0];

  if (file) {
    selectedFile.value = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      bImageError.value = false
      previewSrc.value = e.target.result;
    };
    reader.readAsDataURL(file);
    toast.add({ severity: 'info', summary: 'Éxito', detail: 'Foto seleccionada correctamente', life: 3000 });
  }
}

const onImageError = () => {
  bImageError.value = true
}

const isUpdateLoading = ref(false)
const updateQuiro = async () => {
  //console.log(oQuiropracticoValues.value)

  const sanitizeValue = (value) => {
    return value && typeof value === 'string' ? value.trim() : '';
  };

  const sanitizeNumber = (value) => {
    return value && !isNaN(value) ? value : '';
  };

  // Crear Form Data
  const formData = new FormData()

  formData.append('tipo_documento', sanitizeValue(oQuiropracticoValues.value.tipo_documento));
  formData.append('numero_documento', sanitizeValue(oQuiropracticoValues.value.numero_documento));
  formData.append('nombre', sanitizeValue(oQuiropracticoValues.value.nombre));
  formData.append('apellido', sanitizeValue(oQuiropracticoValues.value.apellido));
  formData.append('genero', sanitizeValue(oQuiropracticoValues.value.genero));
  formData.append('fecha_nacimiento', sanitizeValue(oQuiropracticoValues.value.fecha_nacimiento));
  formData.append('direccion', sanitizeValue(oQuiropracticoValues.value.direccion));
  formData.append('telefono', sanitizeValue(oQuiropracticoValues.value.telefono));
  formData.append('email', sanitizeValue(oQuiropracticoValues.value.email));

  //Datos de Quiropractico
  //console.log('id_sede', oQuiropracticoValues.value.id_sede)
  formData.append('id_sede', sanitizeNumber(oQuiropracticoValues.value.id_sede));
  formData.append('numero_colegiatura', sanitizeValue(oQuiropracticoValues.value.numero_colegiatura));
  formData.append('especialidad', sanitizeValue(oQuiropracticoValues.value.especialidad));
  formData.append('datos_contacto', sanitizeValue(oQuiropracticoValues.value.datos_contacto));
  formData.append('estado', sanitizeNumber(oQuiropracticoValues.value.estado));

  isUpdateLoading.value = true
  try {
    const response = await updateQuiropractico(oQuiropracticoValues.value.id, formData)
    await cargarQuiropracticos()
    isUpdateLoading.value = false
    editDialog.value = false
  }
  catch (error) {
    handleServerError(error)
  }
}

watch([
  isQuiropracticosLoading,
  isSedeLoading
], () => {
  if (
    isQuiropracticosLoading.value ||
    isSedeLoading.value
  )
    isPageLoading.value = true
  else
    isPageLoading.value = false
})

onMounted(() => {
  cargarSedes()
  cargarQuiropracticos()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="deleteDialog"
      :title="`¿Desea eliminar este quiropractico? \n ${oQuiropracticoValues.apellido} ${oQuiropracticoValues.nombre}`"
      v-on:affirmation="deleteFn">
    </YesNoDialog>
    <p class="text-3xl font-bold text-secondary">Todos los quiroprácticos</p>
    <DataTable v-model:filters="filters" :value="aQuiropracticos" removable-sort table-style="min-width: 50rem"
      filter-display="row" data-key="id" paginator show-gridlines :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas">
      <!-- Header -->
      <template #header>
        <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
      </template>

      <!-- ID -->
      <Column field="id" header="#" sortable style="min-width: 3rem;"></Column>

      <!-- Sede -->
      <Column field="sede.nombre" header="Sede" :show-filter-menu="false" sortable style="min-width: 5rem;">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-if="id_sede != null" v-model:model-value="filterModel.value" disabled></InputText>
          <Select v-else v-model="filterModel.value" @change="filterCallback()" :options="aSedesSelect"
            option-label="label" option-value="label" placeholder="Seleccionar sede"></Select>
        </template>
      </Column>

      <!-- Tipo Documento -->
      <Column field="persona.tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable
        style="min-width: 5rem">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aTipoDocumentoSelect"
            option-label="value" option-value="value" placeholder="Filtrar por Tipo Documento"></Select>
        </template>
      </Column>

      <!-- Apellidos -->
      <Column field="persona.apellido" header="Apellidos" :show-filter-menu="false" sortable style="min-width: 10rem">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model:model-value="filterModel.value" @input="filterCallback()" type="text"
            placeholder="Filtrar por apellido"></InputText>
        </template>
      </Column>

      <!-- Nombres -->
      <Column field="persona.nombre" header="Nombres" :show-filter-menu="false" sortable style="min-width: 10rem">
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model:model-value="filterModel.value" @input="filterCallback()" type="text"
            placeholder="Filtrar por nombre"></InputText>
        </template>
      </Column>

      <!-- Genero -->
      <Column field="persona.genero" header="Genero" :show-filter-menu="false" sortable style="min-width: 8rem">
        <template #filter="{ filterModel, filterCallback }">
          <Select v-model:model-value="filterModel.value" @change="filterCallback()" :options="aGeneroSelect"
            option-label="value" option-value="value" placeholder="Filtrar por genero"></Select>
        </template>
      </Column>

      <!-- Fecha Nacimiento -->
      <Column field="persona.fecha_nacimiento" header="Fecha nacimiento" :show-filter-menu="false" sortable
        style="min-width: 12rem">
        <template #body="quiropracticoItem">
          {{ formatDate(quiropracticoItem.data.persona.fecha_nacimiento) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker v-model:model-value="filterModel.value" :manual-input="false" @value-change="filterCallback()"
            placeholder="Filtrar por fecha de nacimineto" date-format="dd/mm/yy"></DatePicker>
        </template>
      </Column>

      <!-- Acciones -->
      <Column :exportable="false" style="min-width: 11rem">
        <template #body="quiropracticoItem">
          <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2"
            @click="verQuiro(quiropracticoItem.data)"></Button>
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editQuiro(quiropracticoItem.data)"></Button>
          <Button icon="pi pi-trash" outlined rounded severity="danger"
            @click="deleteQuiro(quiropracticoItem.data)"></Button>
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="editDialog" :show-header="false" modal :draggable="false" :closable="false"
      class="w-4/5 lg:w-[645px] relative overflow-hidden pt-4">

      <Preloader v-if="isUpdateLoading"></Preloader>

      <p class="text-2xl font-bold text-primary">Actualizar informacion</p>

      <div class="grid grid-cols-2 gap-4">

        <!-- Foto -->
        <div class="col-span-2 flex flex-col">
          <p class="text-xl font-bold">Foto</p>
          <Avatar icon="pi pi-user" size="xlarge" shape="circle"></Avatar>
          <!-- <div class="grid grid-cols-2 gap-4">
            <FileUpload mode="basic" name="foto" accept="image/*" choose-label="Seleccionar" :max-file-size="1000000"
              @select="onFileSelect" custom-upload auto class="p-button-outlined col-span-2 w-full"></FileUpload>
            <Button v-if="previewSrc && !bImageError" v-tooltip.bottom="'Eliminar'" label="Eliminar imagen"
              icon="pi pi-trash" class="p-button-danger col-span-2" @click="removeImage"></Button>
          </div>
          <div v-if="previewSrc && !bImageError">
            <div class="overflow-hidden w-60 h-60 md:w-72 md:h-72 shadow grid place-items-center mx-auto">
              <img :src="previewSrc" alt="Imagen" class="w-60 h-60 md:w-72 md:h-72" @error="onImageError">
            </div>
          </div> -->
        </div>
        <!-- Data -->
        <div class="col-span-2 grid grid-cols-4 gap-3">

          <!-- Nombre -->
          <div class="col-span-4">
            <label for="nombre_quiropractico" class="block font-bold mb-3">Nombre</label>
            <InputText id="nombre_quiropractico" :disabled="verQuiropractico" v-model="oQuiropracticoValues.nombre"
              fluid>
            </InputText>
          </div>

          <!-- Apellido -->
          <div class="col-span-4">
            <label for="apellido_quiropractico" class="block font-bold mb-3">Apellido</label>
            <InputText id="apellido_quiropractico" :disabled="verQuiropractico" v-model="oQuiropracticoValues.apellido"
              fluid>
            </InputText>
          </div>

          <!-- Documentos -->
          <div class="col-span-4 grid grid-cols-6 gap-4 items-end">

            <!-- Tipo de Documento -->
            <div class="col-span-2">
              <label for="tipo_documento_quiro" class="block font-bold mb-3">Tipo de Documento</label>
              <Select id="tipo_documento_quiro" :disabled="verQuiropractico"
                v-model:model-value="oQuiropracticoValues.tipo_documento" :options="aTipoDocumentoSelect"
                option-label="value" option-value="value"></Select>
            </div>

            <!-- Numero de documento -->
            <div class="col-span-4">
              <label for="num_documento_quiro" class="block font-bold mb-3">Numero de Documento</label>
              <InputText id="num_documento_quiro" :disabled="verQuiropractico"
                v-model="oQuiropracticoValues.numero_documento" fluid>
              </InputText>
            </div>
          </div>

          <!-- Numero colegiatura -->
          <div class="col-span-4">
            <label for="num_colegiatura_quiro" class="block font-bold mb-3">Numero de Colegiatura</label>
            <InputText id="num_colegiatura_quiro" :disabled="verQuiropractico"
              v-model="oQuiropracticoValues.numero_colegiatura" fluid>
            </InputText>
          </div>

          <div class="col-span-4 grid grid-cols-6 gap-4 items-end">

            <!-- Genero -->
            <div class="col-span-2">
              <label for="genero_quiro" class="block font-bold mb-3">Genero</label>
              <Select id="genero_quiro" :disabled="verQuiropractico" v-model:model-value="oQuiropracticoValues.genero"
                fluid :options="aGeneroSelect" option-label="value" option-value="value"></Select>
            </div>

            <!-- Fecha de nacimiento -->
            <div class="col-span-4">
              <label for="fecha_nacimiento_quiro" class="block font-bold mb-3">Fecha de nacimiento</label>
              <DatePicker id="fecha_nacimiento_quiro" :disabled="verQuiropractico"
                v-model:model-value="oQuiropracticoValues.fecha_nacimiento" fluid>
              </DatePicker>
            </div>
          </div>

          <!-- Telefono -->
          <div class="col-span-4">
            <label for="telefono" class="block font-bold mb-3">Telefono</label>
            <InputMask id="telefono" :disabled="verQuiropractico" v-model:model-value="oQuiropracticoValues.telefono"
              mask="999 999 999" class="w-full">
            </InputMask>
          </div>

          <!-- Direccion -->
          <div class="col-span-4">
            <label for="direccion" class="block font-bold mb-3">Direccion</label>
            <InputText id="direccion" :disabled="verQuiropractico" v-model="oQuiropracticoValues.direccion" fluid>
            </InputText>
          </div>

          <!-- Numero colegiatura -->
          <div class="col-span-4">
            <label for="datos_contacto" class="block font-bold mb-3">Datos de contacto</label>
            <Textarea id="datos_contacto" :disabled="verQuiropractico"
              v-model:model-value="oQuiropracticoValues.direccion" fluid></Textarea>
          </div>
        </div>


      </div>
      <div class="flex gap-4 mt-4">
        <Button label="Cerrar" class="p-button-outlined" @click="closeVerQuiro"></Button>
        <Button v-if="!verQuiropractico" label="Actualizar" @click="updateQuiro"></Button>
      </div>

    </Dialog>
  </div>
</template>