<script setup>
import Preloader from '@/components/Preloader.vue';
import { createCategoria } from '@/service/mantenimiento/ArticulosService';
import { handleServerError } from '@/utils/Util';
import { useToast } from 'primevue';
import { ref, watch } from 'vue';


// Global Variables

// Inputs
const sNombreInput = ref('')
const nEstadoSelected = ref(1)

// Selects
const aEstadoSelect = ref([
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 2 },
])

// Loading State
const isPageLoading = ref(false)

// Update Data
const oNuevaCategoria = ref()
const toast = useToast()

const resetInputs = () => {
  sNombreInput.value = ''
  nEstadoSelected.value = 1
}

watch([sNombreInput, nEstadoSelected], (values) => {
  const [nombre, estado] = values
  oNuevaCategoria.value = { nombre, estado }
})

const onCreateCategoria = async () => {
  isPageLoading.value = true
  try {
    const response = await createCategoria(oNuevaCategoria.value)
    //console.log('check', response)
    resetInputs()
    toast.add({
      severity: 'success',
      summary: 'Se ha creado la categoria exitosamente',
      life: 5000
    })
    isPageLoading.value = false
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'Crear nueva categoria', toast)
  }
}

</script>
<template>
  <div class="card relative overflow-hidden w-[500px]">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Agregar nueva categoria</p>
      <div>
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText class="w-full" id="nombre" v-model:model-value="sNombreInput" placeholder="Nombre de la categoria">
        </InputText>
      </div>

      <div>
        <label for="estado" class="block font-bold mb-3">Estado</label>
        <Select class="w-full" id="estado" v-model:model-value="nEstadoSelected" :options="aEstadoSelect"
          option-label="label" option-value="value">
        </Select>
      </div>

      <Button icon="pi pi-check" label="Agregar nueva categoria" class="w-full" :disabled="sNombreInput.length == 0"
        @click="onCreateCategoria"></Button>
    </div>
  </div>
</template>