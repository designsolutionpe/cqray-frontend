<script setup>
import Preloader from '@/components/Preloader.vue';
import { getRoles, updateRole } from '@/service/mantenimiento/RoleService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Global
const aUsuarios = ref([])

const aEstadosSelect = ref([
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 0 },
])

const oUsuarioSelected = ref({})

const toast = useToast()

const filters = ref({})

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}

initFilters()

const resetFilters = () => initFilters()

// Loaders
const isRolesLoading = ref(true)
const isPageLoading = ref(true)

watch(
  [
    isRolesLoading,
  ],
  ([
    roles,
  ]) => {
    isPageLoading.value = (roles)
  }
)

// Load data

const cancelToken = ref()

const cargarRoles = async () => {
  isRolesLoading.value = true
  try {
    const response = await getRoles(cancelToken.value.token)
    if (response) {
      aUsuarios.value = response
    }
    isRolesLoading.value = false
  }
  catch (error) {
    isRolesLoading.value = false
    handleServerError(error, 'Obtener los roles', toast)
  }
}

// EDIT DIALOG

const bShowEdit = ref(false)

const isUpdateLoading = ref(false)

const loadSelectedUser = (user) => {
  //console.log('LOAD USER', user)
  oUsuarioSelected.value = {
    id: user.id,
    nombre: user.nombre,
    activo: user.activo
  }
}

const onOpenEditDialog = (user) => {
  loadSelectedUser(user)
  bShowEdit.value = true
}

const onResetComponent = () => {
  bShowEdit.value = false
  cargarRoles()
}

const onUpdateUser = async () => {
  isUpdateLoading.value = true
  //console.log('user', oUsuarioSelected.value)
  try {
    const response = await updateRole(oUsuarioSelected.value.id, oUsuarioSelected.value)
    isUpdateLoading.value = false
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado', life: 3000 });
    onResetComponent()
  }
  catch (error) {
    isUpdateLoading.value = false
    handleServerError(error, 'Actualizando usuario', toast)
  }
}

// LIFE COMPONENT FUNCTIONS
onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarRoles()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Todos los roles</p>
      <DataTable :value="aUsuarios" removable-sort table-style="min-width: 30rem" data-key="id" show-gridlines
        :rows="10" paginator v-model:filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} usuarios">

        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <router-link to="#" class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2">
              <Button icon="pi pi-plus" label="Crear rol" fluid disabled></Button>
            </router-link>
            <IconField class="col-span-12 sm:col-span-4 lg:col-span-6 xl:col-span-6 2xl:col-span-8 lg:justify-self-end">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText class="w-full" v-model:model-value="filters['global'].value" placeholder="Filtro global">
              </InputText>
            </IconField>
          </div>
        </template>

        <Column header="#" sortable style="min-width: 5rem">
          <template #body="item">{{ item.index + 1 }}</template>
        </Column>

        <Column field="nombre" header="Nombre"></Column>
        <Column field="activo" header="Estado">
          <template #body="item">
            <Tag :severity="item.data.activo ? 'success' : 'secondary'">
              {{ item.data.activo ? 'Activo' : 'Inactivo' }}
            </Tag>
          </template>
        </Column>

        <Column :exportable="false" style="width: 5rem" header="Acciones">
          <template #body="item">
            <Button icon="pi pi-pencil" v-tooltip.top="{ value: 'Editar' }" outlined rounded class="mr-2"
              @click="onOpenEditDialog(item.data)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="bShowEdit" style="width: 450px" class="relative overflow-hidden" :show-header="false"
    :closable="false" modal :draggable="false">
    <Preloader v-if="isUpdateLoading"></Preloader>
    <div class="grid grid-cols-12 gap-3 pt-5">
      <p class="col-span-12 text-2xl font-bold text-secondary">Editar rol</p>
      <div class="col-span-12">
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText id="nombre" v-model:model-value="oUsuarioSelected.nombre" fluid disabled></InputText>
      </div>
      <div class="col-span-12">
        <label for="estado" class="block font-bold mb-3">Estado</label>
        <Select id="nombre" v-model:model-value="oUsuarioSelected.activo" :options="aEstadosSelect" option-label="label"
          option-value="value" fluid>
          <template #option="option">
            <Tag :severity="option.option.value ? 'success' : 'secondary'">{{ option.option.label }}</Tag>
          </template>
        </Select>
      </div>
      <div class="col-span-12 mt-3 grid grid-cols-2 gap-3">
        <Button icon="pi pi-times" label="Cancelar" outlined @click="bShowEdit = false"></Button>
        <Button icon="pi pi-check" label="Actualizar" @click="onUpdateUser"></Button>
      </div>
    </div>
  </Dialog>
</template>