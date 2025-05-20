<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { getPersonas } from '@/service/mantenimiento/PersonaService';
import { updatePersona } from '@/service/mantenimiento/PersonaService';
import { deletePersona } from '@/service/mantenimiento/PersonaService';
import { formatDate, handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const toast = useToast()
const aPersonas = ref([])
const oFilters = ref()

const bSeePersona = ref(false)
const bEditPersona = ref(false)

const oPersonaInfo = ref({})
const deleteDialog = ref();
const cancelToken = ref();

const oInvalid = ref({
  tipo_documento: false,
  numero_documento: false,
  nombre: false,
  apellido: false,
  genero: false,
  fecha_nacimiento: false,
  direccion: false,
  telefono: false,
  email: false,
  foto: false
})

const aTipoDocumentoSelect = ref([
  { label: "DNI" },
  { label: "Carnet de Extranjería".toUpperCase() },
  { label: "Pasaporte".toUpperCase() },
  { label: "Otro".toUpperCase() },
])
const aGenero = ref([
  { label: "Masculino" },
  { label: 'Femenino' }
])

const isPersonasLoading = ref(true)
const bUpdatePersona = ref(false)
const isPageLoading = ref(true)

const cargarPersonas = async () => {
    isPersonasLoading.value = true    
    try {
        const response = await getPersonas(cancelToken.value.token)
        if (response) {
            aPersonas.value = response.map((persona) => ({
            ...persona,
            //fecha_nacimiento: formatDate(persona.fecha_nacimiento),
            foto: persona.foto ? persona.foto : null
            }))
        }
        isPersonasLoading.value = false
    } catch (error) {
        handleServerError(error, 'Personas',toast)
    }
}

const initFilters = () => {
    oFilters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
        apellido: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tipo_documento: { value: null, matchMode: FilterMatchMode.EQUALS },
        numero_documento: { value: null, matchMode: FilterMatchMode.CONTAINS },
        fecha_nacimiento: { value: null, matchMode: FilterMatchMode.DATE_IS },
        genero: { value: null, matchMode: FilterMatchMode.EQUALS }
    }
}
initFilters()

const updatePersonaInfo  = (persona) => {
    oPersonaInfo.value = {
        id: persona.id,
        tipo_documento: persona.tipo_documento,
        numero_documento: persona.numero_documento,
        nombre: persona.nombre,
        apellido: persona.apellido,
        genero: persona.genero,
        fecha_nacimiento: persona.fecha_nacimiento,
        direccion: persona.direccion,
        telefono: persona.telefono,
        email: persona.email,
        foto: persona.foto
    }
}

const onOpenViewDialog = (persona) => {
    updatePersonaInfo(persona)
    bSeePersona.value = true
}

const onOpenEditDialog = (persona) => {
    updatePersonaInfo(persona)
    bSeePersona.value = true
    bEditPersona.value = true
}

const onCloseDialog = () => {
    bSeePersona.value = false
    bEditPersona.value = false
}

const updateCurrentPersona = async () => {
    bUpdatePersona.value = true
    try {
        const formData = new FormData()
        formData.append('id', oPersonaInfo.value.id)
        formData.append('tipo_documento', oPersonaInfo.value.tipo_documento)
        formData.append('numero_documento', oPersonaInfo.value.numero_documento)
        formData.append('nombre', oPersonaInfo.value.nombre)
        formData.append('apellido', oPersonaInfo.value.apellido)
        formData.append('genero', oPersonaInfo.value.genero)
        formData.append('fecha_nacimiento', oPersonaInfo.value.fecha_nacimiento)
        formData.append('direccion', oPersonaInfo.value.direccion)
        formData.append('telefono', oPersonaInfo.value.telefono)
        formData.append('email', oPersonaInfo.value.email)

        await updatePersona(oPersonaInfo.value.id, formData)
        bUpdatePersona.value = false
        onCloseDialog()
        cargarPersonas()
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos actualizados correctamente.', life: 3000 })
    } catch (error) {
        handleServerError(error, 'Actualizar Persona', toast)
    }
}

const onDeletePersona = async () => {
    try {
        isPageLoading.value = true
        await deletePersona(oPersonaInfo.value.id)
        cargarPersonas()
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Persona eliminada correctamente.', life: 3000 })
    } catch (error) {
        handleServerError(error, 'Eliminar Persona', toast)
    }
}

const openDeleteDialog = (persona) => {
    updatePersonaInfo(persona)
    deleteDialog.value.showDialog()
}

watch([
    isPersonasLoading,
], () => {
    if (isPersonasLoading.value) {
        isPageLoading.value = true
    } else {
        isPageLoading.value = false
    }
})

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarPersonas()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

const isValidDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()); // Verifica si la fecha es válida
}

</script>

<template>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <YesNoDialog ref="deleteDialog" title="¿Desea eliminar esta persona?" v-on:affirmation="onDeletePersona">
        </YesNoDialog>

        <p class="text-2xl font-bold text-secondary">Personal</p>

        <DataTable :value="aPersonas" removable-sort table-style="min-width: 50rem" data-key="id" show-gridlines
            v-model:filters="oFilters" filter-display="row" :rows="10" paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} personas">

            <template #header>
                <div class="flex justify-between">
                  <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="cleanFilters()" outlined></Button>
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search"></i>
                    </InputIcon>
                    <InputText v-model:model-value="oFilters['global'].value" placeholder="Filtro global"></InputText>
                  </IconField>
                </div>
            </template>

            <!-- Tipo Documento -->
            <Column field="tipo_documento" header="Tipo Documento" :show-filter-menu="false" sortable style="min-width: 5rem">
                <template #body="slotProps">
                    {{ slotProps.data.tipo_documento }}
                </template>
                <template #filter="{ filterModel, filterCallback}">
                    <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
                    option-value="label" :options="aTipoDocumentoSelect" placeholder="Filtrar por Tipo Documento"
                    style="min-width: 16rem;"></Select>
                </template>
            </Column>

            <!-- Numero Documento -->
            <Column field="numero_documento" header="Numero Documento" :show-filter-menu="false" sortable style="min-width: 10rem;">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                    placeholder="Filtrar por documento" />
                </template>
            </Column>

            <!-- Apellido -->
            <Column field="apellido" header="Apellido" :show-filter-menu="false" sortable style="min-width: 10rem;">
                <template #body="slotProps">
                    {{ slotProps.data.apellido.toUpperCase() }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                    placeholder="Filtrar por apellido" />
                </template>
            </Column>

            <!-- Nombre -->
            <Column field="nombre" header="Nombre" :show-filter-menu="false" sortable style="min-width: 10rem;">
                <template #body="slotProps">
                    {{ slotProps.data.nombre.toUpperCase() }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                    placeholder="Filtrar por nombre" />
                </template>
            </Column>

            <!-- Genero -->
            <Column field="genero" header="Genero" :show-filter-menu="false" sortable style="min-width: 8rem;">
                <template #body="slotProps">
                    {{ slotProps.data.genero.toUpperCase() }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Select v-model:model-value="filterModel.value" @change="filterCallback()" option-label="label"
                    option-value="label" :options="aGenero" placeholder="Filtrar por Genero"></Select>
                </template>
            </Column>

            <!-- Fecha Nacimiento -->
            <Column field="fecha_nacimiento" header="Fecha Nacimiento" :show-filter-menu="false" sortable style="min-width: 15rem;">
                <template #body="slotProps">
                    {{ isValidDate(slotProps.data.fecha_nacimiento) ? (formatDate(slotProps.data.fecha_nacimiento)) : '' }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <DatePicker v-model="filterModel.value" :manual-input="false" @value-change="filterCallback()"
                        placeholder="Filtrar por Fecha Nacimiento" date-format="dd/mm/yy">
                    </DatePicker>
                </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="onOpenViewDialog(slotProps.data)"></Button>
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onOpenEditDialog(slotProps.data)"></Button>
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-2" @click="openDeleteDialog(slotProps.data)"></Button>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="bSeePersona" :show-header="false" modal :draggable="false" :closable="false"
            class="w-4/5 lg:w-[650px] relative overflow-hidden">
            <Preloader v-if="bUpdatePersona"></Preloader>
            <div class="flex flex-col gap-6 pt-5">
                <p class="text-2xl font-bold m-0 text-secondary">Informacion de personal</p>
                <div class="grid grid-cols-4 gap-4">
                    <div class="col-span-4 md:col-span-1">
                        <label for="tipo_documento" class="block font-bold mb-3">Tipo Documento</label>
                        <Select id="tipo_documento" v-model:model-value="oPersonaInfo.tipo_documento" fluid
                        :disabled="!bEditPersona" :options="aTipoDocumentoSelect" option-label="label" option-value="label"
                        :invalid="oInvalid.tipo_documento"></Select>
                        <small v-if="oInvalid.tipo_documento" class="text-red-500">Este campo es requerido*</small>
                    </div>
                    <div class="col-span-4 md:col-span-3">
                        <label for="numero_documento" class="block font-bold mb-3">Numero Documento</label>
                        <InputText id="numero_documento" v-model:model-value="oPersonaInfo.numero_documento" fluid
                        :disabled="!bEditPersona" :invalid="oInvalid.numero_documento"></InputText>
                        <small v-if="oInvalid.numero_documento" class="text-red-500">Este campo es requerido*</small>
                    </div>
                </div>

                <div>
                    <label for="apellido" class="block font-bold mb-3">Apellido</label>
                    <InputText id="apellido" v-model:model-value="oPersonaInfo.apellido" fluid :disabled="!bEditPersona"
                    :invalid="oInvalid.apellido">
                    </InputText>
                    <small v-if="oInvalid.apellido" class="text-red-500">Este campo es requerido*</small>
                </div>

                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model:model-value="oPersonaInfo.nombre" fluid :disabled="!bEditPersona"
                    :invalid="oInvalid.nombre">
                    </InputText>
                    <small v-if="oInvalid.nombre" class="text-red-500">Este campo es requerido*</small>
                </div>

                <div class="grid grid-cols-6 gap-4">
                    <div class="col-span-6 md:col-span-2">
                        <label for="genero" class="block font-bold mb-3">Genero</label>
                        <Select id="genero" v-model:model-value="oPersonaInfo.genero" fluid :disabled="!bEditPersona"
                        :options="aGenero" option-label="label" option-value="label" :invalid="oInvalid.genero"></Select>
                        <small v-if="oInvalid.genero" class="text-red-500">Este campo es requerido*</small>
                    </div>

                    <div class="col-span-6 md:col-span-2">
                        <label for="fecha_nacimiento" class="block font-bold mb-3">Fecha Nacimiento</label>
                        <InputText id="fecha_nacimiento" type="date" v-model:model-value="oPersonaInfo.fecha_nacimiento" fluid
                        :disabled="!bEditPersona" :invalid="oInvalid.fecha_nacimiento"></InputText>
                        <small v-if="oInvalid.fecha_nacimiento" class="text-red-500">Este campo es requerido*</small>
                    </div>

                    <div class="col-span-6 md:col-span-2">
                        <label for="telefono" class="block font-bold mb-3">Telefono</label>
                        <InputText id="telefono" v-model:model-value="oPersonaInfo.telefono" fluid :disabled="!bEditPersona"
                        :invalid="oInvalid.telefono">
                        </InputText>
                        <small v-if="oInvalid.telefono" class="text-red-500">Este campo es requerido*</small>
                    </div>
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-3">Direccion</label>
                    <InputText id="direccion" v-model:model-value="oPersonaInfo.direccion" fluid :disabled="!bEditPersona"
                    :invalid="oInvalid.direccion">
                    </InputText>
                    <small v-if="oInvalid.direccion" class="text-red-500">Este campo es requerido*</small>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 md:col-span-1">
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" v-model:model-value="oPersonaInfo.email" fluid :disabled="!bEditPersona"
                        :invalid="oInvalid.email">
                        </InputText>
                        <small v-if="oInvalid.email" class="text-red-500">Este campo es requerido*</small>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <Button :class="{ 'col-span-2': !bEditPersona }" label="Cancelar" icon="pi pi-times" outlined
                    @click="onCloseDialog"></Button>
                    <Button v-if="bEditPersona" label="Actualizar" icon="pi pi-check" @click="updateCurrentPersona"></Button>
                </div>
            </div>
        </Dialog>
    </div>
</template>