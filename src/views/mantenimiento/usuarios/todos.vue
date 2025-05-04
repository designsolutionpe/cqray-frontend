<script setup>
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { getPersonas } from '@/service/mantenimiento/PersonaService';
import { getRoles } from '@/service/mantenimiento/RoleService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { deleteUsuario, getUsuarios, updateUsuario } from '@/service/mantenimiento/UsuarioService';
import { handleServerError } from '@/utils/Util';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// Global
const store = useStore()
const id_user = computed(() => store.getters.id)

const aUsuarios = ref([])

const aRolesSelect = ref([])
const aPersonalSelect = ref([])
const aSedeSelect = ref([])

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
const isUsersLoading = ref(true)
const isRolesLoading = ref(true)
const isPersonalLoading = ref(true)
const isSedesLoading = ref(true)
const isPageLoading = ref(true)

watch(
  [
    isUsersLoading,
    isRolesLoading,
    isPersonalLoading,
    isSedesLoading
  ],
  ([
    users,
    roles,
    personal,
    sedes
  ]) => {
    isPageLoading.value = (users || roles || personal || sedes)
  }
)

// Load data

const cancelToken = ref()

const cargarUsuarios = async () => {
  isUsersLoading.value = true
  try {
    const response = await getUsuarios(cancelToken.value.token)
    console.log('check usuarios', response)
    if (response) {
      aUsuarios.value = response
    }
    isUsersLoading.value = false
  }
  catch (error) {
    isUsersLoading.value = false
    handleServerError(error, 'Obtener los usuarios', toast)
  }
}

const cargarRoles = async () => {
  isRolesLoading.value = true
  try {
    const response = await getRoles(cancelToken.value.token, 1)
    if (response) {
      aRolesSelect.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
    }
    isRolesLoading.value = false
  }
  catch (error) {
    isRolesLoading.value = false
    handleServerError(error, 'Obtener los roles', toast)
  }
}

const cargarPersonal = async () => {
  isPersonalLoading.value = true
  try {
    const response = await getPersonas(cancelToken.value.token)
    if (response) {
      aPersonalSelect.value = response.map(s => ({
        label: `${s.nombre} ${s.apellido}`,
        value: s.id
      }))
    }
    isPersonalLoading.value = false
  }
  catch (error) {
    isPersonalLoading.value = false
    handleServerError(error, 'Obtener los roles', toast)
  }
}

const cargarSedes = async () => {
  isSedesLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedeSelect.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
    }
    isSedesLoading.value = false
  }
  catch (error) {
    isSedesLoading.value = false
    handleServerError(error, 'Obtener los roles', toast)
  }
}

// EDIT DIALOG

const bShowEdit = ref(false)
const bUpdate = ref(true)
const bUpdatePassword = ref(false)

const isUpdateLoading = ref(false)

const sClaveInput = ref(null)
const sConfirmarInput = ref(null)

const loadSelectedUser = (user) => {
  console.log('LOAD USER', user)
  oUsuarioSelected.value = {
    id: user.id,
    rol: user.id_rol,
    persona: user.id_persona,
    login: user.login,
    email: user.email,
    sede: user.id_sede
  }
}

const onOpenEditDialog = (user) => {
  loadSelectedUser(user)
  bShowEdit.value = true
}

const onResetComponent = () => {
  bShowEdit.value = false
  oErrors.value = { formatted: true, equals: true }
  cargarUsuarios()
  cargarRoles()
  cargarPersonal()
  cargarSedes()
}

const onUpdateUser = async () => {
  isUpdateLoading.value = true
  console.log('user', oUsuarioSelected.value)
  try {
    const response = await updateUsuario(oUsuarioSelected.value.id, oUsuarioSelected.value)
    isUpdateLoading.value = false
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
    onResetComponent()
  }
  catch (error) {
    isUpdateLoading.value = false
    handleServerError(error, 'Actualizando usuario', toast)
  }
}

const oErrors = ref({
  equals: true,
  formatted: true
})

const onUpdatePassword = active => {
  sClaveInput.value = sConfirmarInput.value = null
  oErrors.value = {
    equals: true,
    formatted: true
  }
}

watch(
  [
    sClaveInput,
    sConfirmarInput
  ],
  ([clave, confirmar]) => {
    oErrors.value.equals = (clave === confirmar)
    oErrors.value.formatted = (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(clave))

    bUpdate.value = (!oErrors.value.equals || !oErrors.value.formatted)
    oUsuarioSelected.value = {
      ...oUsuarioSelected.value,
      password: clave
    }
  }
)

// DELETE USER

const refDeleteDialog = ref(null)

const onDeleteDialog = (id) => {
  oUsuarioSelected.value = { id }
  refDeleteDialog.value.showDialog()
}

const onDeleteUser = async () => {
  isPageLoading.value = true
  try {
    const response = await deleteUsuario(oUsuarioSelected.value.id)
    onResetComponent()
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Eliminar usuario', toast)
  }
}

// LIFE COMPONENT FUNCTIONS
onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarUsuarios()
  cargarRoles()
  cargarPersonal()
  cargarSedes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <YesNoDialog ref="refDeleteDialog" title="¿Deseas eliminar este usuario?" v-on:affirmation="onDeleteUser()">
    </YesNoDialog>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Todos los usuarios</p>
      <DataTable :value="aUsuarios" removable-sort table-style="min-width: 30rem" data-key="id" show-gridlines
        :rows="10" paginator v-model:filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} usuarios">

        <template #header>
          <div class="grid grid-cols-12 gap-4">
            <Button class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2" label="Borrar filtros"
              icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
            <router-link to="/mantenimiento/usuarios/agregar"
              class="col-span-12 sm:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-2">
              <Button icon="pi pi-plus" label="Crear usuario" fluid></Button>
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
        <Column field="login" header="Login" sortable style="min-width: 6rem"></Column>
        <!--
                <Column field="persona.tipo_documento || persona.numero_documento" header="Tipo Documento" sortable style="min-width: 6rem"></Column>
                -->
        <Column header="Tipo Documento" sortable style="min-width: 6rem">
          <template #body="slotProps">
            {{ `${slotProps.data.persona.tipo_documento || ''} ${slotProps.data.persona.numero_documento ||
              ''}` }}
          </template>
        </Column>

        <Column field="persona.apellido" header="Apellidos" sortable style="min-width: 10rem"></Column>
        <Column field="persona.nombre" header="Nombres" sortable style="min-width: 10rem"></Column>
        <Column field="role.nombre" header="Rol" sortable style="min-width: 8rem"></Column>

        <Column :exportable="false" style="min-width: 12rem" header="Acciones">
          <template #body="item">
            <Button icon="pi pi-pencil" v-tooltip.top="{ value: 'Editar' }" outlined rounded class="mr-2"
              @click="onOpenEditDialog(item.data)"></Button>
            <Button icon="pi pi-trash" :disabled="item.data.id == id_user"
              v-tooltip.top="{ value: item.data.id == id_user ? 'No puedes eliminar tu propio usuario' : 'Eliminar' }"
              outlined rounded class="mr-2" severity="danger" @click="onDeleteDialog(item.data.id)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Dialog v-model:visible="bShowEdit" style="width: 450px" class="relative overflow-hidden" :show-header="false"
    :closable="false" modal :draggable="false">
    <Preloader v-if="isUpdateLoading"></Preloader>
    <div class="grid grid-cols-12 gap-3 pt-5">
      <p class="col-span-12 text-2xl font-bold text-secondary">Editar usuario</p>
      <div class="col-span-12">
        <label for="rol" class="block font-bold mb-3">Rol</label>
        <Select id="rol" v-model:model-value="oUsuarioSelected.rol" :options="aRolesSelect" option-label="label"
          option-value="value" fluid></Select>
      </div>
      <div class="col-span-12">
        <label for="persona" class="block font-bold mb-3">Personal</label>
        <Select id="persona" v-model:model-value="oUsuarioSelected.persona" :options="aPersonalSelect"
          option-label="label" option-value="value" fluid filter></Select>
      </div>
      <div class="col-span-12">
        <label for="login" class="block font-bold mb-3">Login</label>
        <InputText id="login" v-model:model-value="oUsuarioSelected.login" fluid></InputText>
      </div>
      <div class="col-span-12">
        <label for="email" class="block font-bold mb-3">Email</label>
        <InputText id="email" v-model:model-value="oUsuarioSelected.email" fluid></InputText>
      </div>
      <div class="col-span-12">
        <label for="sede" class="block font-bold mb-3">Sede</label>
        <Select id="sede" v-model:model-value="oUsuarioSelected.sede" :options="aSedeSelect" option-label="label"
          option-value="value" fluid></Select>
      </div>
      <div class="col-span-12">
        <label for="update_password" class="font-bold mr-3">Actualizar contraseña</label>
        <Checkbox inputId="update_password" v-model:model-value="bUpdatePassword" binary
          @value-change="onUpdatePassword">
        </Checkbox>
      </div>
      <div class="col-span-12" v-if="bUpdatePassword">
        <label for="clave" class="block font-bold mb-3">Contraseña</label>
        <Password id="clave" v-model:model-value="sClaveInput" fluid toggle-mask :feedback="false"
          :invalid="!oErrors.formatted">
        </Password>
        <template v-if="!oErrors.formatted">
          <Message severity="error" size="small" variant="simple">
            <ul class="pl-2 my-0 leading-normal">
              <li v-if="!/.*[a-z].*/.test(sClaveInput)">Debe tener por lo menos una minúscula*</li>
              <li v-if="!/.*[A-Z].*/.test(sClaveInput)">Debe tener por lo menos una mayúscula*</li>
              <li v-if="!/.*[0-9].*/.test(sClaveInput)">Debe tener por lo menos un número*</li>
              <li v-if="!/.*[^a-zA-Z0-9].*/.test(sClaveInput)">Debe tener por lo menos un caractér especial*</li>
              <li v-if="!/^.{8,}$/.test(sClaveInput)">Mínimo 8 caractéres*</li>
            </ul>
          </Message>
        </template>
      </div>
      <div class="col-span-12" v-if="bUpdatePassword">
        <label for="confirmar" class="block font-bold mb-3">Confirmar Contraseña</label>
        <Password id="confirmar" v-model:model-value="sConfirmarInput" fluid toggle-mask :feedback="false"
          :invalid="!oErrors.equals">
        </Password>
        <template v-if="!oErrors.equals">
          <Message severity="error" size="small" variant="simple">Las contraseñas deben ser iguales*</Message>
        </template>
      </div>
      <div class="col-span-12 mt-3 grid grid-cols-2 gap-3">
        <Button icon="pi pi-times" label="Cancelar" outlined @click="bShowEdit = false"></Button>
        <Button icon="pi pi-check" label="Actualizar" :disabled="bUpdate && bUpdatePassword"
          @click="onUpdateUser"></Button>
      </div>
    </div>
  </Dialog>
</template>