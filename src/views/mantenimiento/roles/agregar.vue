<script setup>
import Preloader from '@/components/Preloader.vue';
import { createRole } from '@/service/mantenimiento/RoleService';
import { handleServerError } from '@/utils/Util';
import { useToast } from 'primevue';
import { ref, watch } from 'vue';


const toast = useToast()

// Loaders
const isPageLoading = ref(false)

const aEstadosSelect = ref([
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 0 },
])

const oUsuarioSelected = ref({})

// PASSWORD CHECK

const sNombreInput = ref(null)
const nEstadoSelected = ref(null)

const bUpdate = ref(true)


watch(
  [
    sNombreInput,
    nEstadoSelected
  ],
  ([nombre, activo]) => {
    bUpdate.value = (
      !(nombre && nombre.length > 0) ||
      !(activo == 0 || activo == 1)
    )
    oUsuarioSelected.value = { nombre, activo }
  }
)

const onResetComponent = () => {
  oUsuarioSelected.value = {}
  sNombreInput.value = nEstadoSelected.value = null
  isPageLoading.value = false
}

const onUpdateUser = async () => {
  console.log('user', oUsuarioSelected.value)
  isPageLoading.value = true
  try {
    const response = await createRole(oUsuarioSelected.value)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado', life: 3000 });
    onResetComponent()
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Crear rol', toast)
  }
}

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="grid grid-cols-12 gap-3">
      <p class="col-span-12 text-xl font-bold text-secondary">Crear nuevo rol</p>
      <div class="col-span-12">
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText id="nombre" v-model:model-value="sNombreInput" fluid></InputText>
      </div>
      <div class="col-span-12">
        <label for="estado" class="block font-bold mb-3">Estado</label>
        <Select id="estado" v-model:model-value="nEstadoSelected" :options="aEstadosSelect" option-label="label"
          option-value="value" fluid></Select>
      </div>
      <div class="col-span-12 mt-3 grid grid-cols-6 gap-3">
        <Button class="col-span-6 lg:col-span-2" icon="pi pi-check" label="Crear rol" :disabled="bUpdate"
          @click="onUpdateUser"></Button>
      </div>
    </div>
  </div>
</template>