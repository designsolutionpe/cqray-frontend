<script setup>
import Preloader from '@/components/Preloader.vue';
import { getPersonas } from '@/service/mantenimiento/PersonaService';
import { getRoles } from '@/service/mantenimiento/RoleService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { createUsuario } from '@/service/mantenimiento/UsuarioService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';


const toast = useToast()

// Loaders
const isRolesLoading = ref(true)
const isPersonalLoading = ref(true)
const isSedesLoading = ref(true)
const isPageLoading = ref(true)

watch(
  [
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

const aRolesSelect = ref([])
const aPersonalSelect = ref([])
const aSedeSelect = ref([])

const oUsuarioSelected = ref({})

// LOAD DATA

const cancelToken = ref()

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

// LIFE COMPONENT FUNCTIONS
onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarRoles()
  cargarPersonal()
  cargarSedes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

// PASSWORD CHECK

const nRolSelected = ref(null)
const nPersonaSelected = ref(null)
const sLoginInput = ref(null)
const sEmailInput = ref(null)
const nSedeSelected = ref(null)
const sClaveInput = ref(null)

const bUpdate = ref(true)

const oErrors = ref({
  formatted: true
})


watch(
  [
    nRolSelected,
    nPersonaSelected,
    sLoginInput,
    sEmailInput,
    nSedeSelected,
    sClaveInput
  ],
  ([id_rol, id_persona, login, email, id_sede, clave]) => {
    oErrors.value.formatted = (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(clave))

    bUpdate.value = (
      !oErrors.value.formatted ||
      !(id_rol != null) ||
      !(id_persona != null) ||
      !(login && login.length > 0) ||
      !((email && email.length > 0) && (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)))
    )
    oUsuarioSelected.value = {
      id_rol, id_persona, login, email, id_sede,
      password: clave
    }
  }
)

const onResetComponent = () => {
  oUsuarioSelected.value = {}
  nRolSelected.value = nPersonaSelected.value = nSedeSelected.value = sLoginInput.value = sEmailInput.value = sClaveInput.value = null
  cargarRoles()
  cargarPersonal()
  cargarSedes()
  oErrors.value = { formatted: false }
}

const onUpdateUser = async () => {
  console.log('user', oUsuarioSelected.value)
  isPageLoading.value = true
  try {
    const response = await createUsuario(oUsuarioSelected.value)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
    onResetComponent()
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Crear usuario', toast)
  }
}

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="grid grid-cols-12 gap-3">
      <p class="col-span-12 text-xl font-bold text-secondary">Crear nuevo usuario</p>
      <div class="col-span-12 md:col-span-4">
        <label for="rol" class="block font-bold mb-3">Rol</label>
        <Select id="rol" v-model:model-value="nRolSelected" :options="aRolesSelect" option-label="label"
          option-value="value" fluid></Select>
      </div>
      <div class="col-span-12 md:col-span-8">
        <label for="persona" class="block font-bold mb-3">Personal</label>
        <Select id="persona" v-model:model-value="nPersonaSelected" :options="aPersonalSelect" option-label="label"
          option-value="value" fluid filter></Select>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label for="login" class="block font-bold mb-3">Login</label>
        <InputText id="login" v-model:model-value="sLoginInput" fluid></InputText>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label for="email" class="block font-bold mb-3">Email</label>
        <InputText id="email" v-model:model-value="sEmailInput" fluid></InputText>
      </div>
      <div class="col-span-12">
        <label for="sede" class="block font-bold mb-3">Sede</label>
        <Select id="sede" v-model:model-value="nSedeSelected" :options="aSedeSelect" option-label="label"
          option-value="value" fluid></Select>
      </div>
      <div class="col-span-12">
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
      <div class="col-span-12 mt-3 grid grid-cols-6 gap-3">
        <Button class="col-span-6 lg:col-span-2" icon="pi pi-check" label="Crear usuario" :disabled="bUpdate"
          @click="onUpdateUser"></Button>
      </div>
    </div>
  </div>
</template>