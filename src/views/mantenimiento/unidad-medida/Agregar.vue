<script setup>
  import { ref, watch } from 'vue'
  import { useToast } from 'primevue'
  import Preloader from '@/components/Preloader.vue'
  import { createUnidadMedida } from '@/service/mantenimiento/UnidadMedidaService'
  import { handleServerError } from '@/utils/Util'

  const isPageLoading = ref(false)
  const toast = useToast()

  const oUnidadMedida = ref({})

  const sNombreInput = ref("")

  watch(
  [
    sNombreInput,
  ],
  ([nombre]) => {
    oUnidadMedida.value = {
      nombre
    }
  })

  const reset = () => {
    sNombreInput.value = ""
    oUnidadMedida.value = {}
  }

  const crearUnidad = async () => {
    isPageLoading.value = true
    try
    {
      const response = await createUnidadMedida(oUnidadMedida.value)
      isPageLoading.value = false
      reset()
      toast.add({
        severity: 'success',
        summary: 'Se ha creado la unidad de medida  exitosamente',
        life: 5000
      })
    }
    catch(error)
    {
      isPageLoading.value = false
      handleServerError(error,"Crear unidad",toast)
    }
  }
</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Agregar nueva medida</p>
      <div>
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText fluid id="nombre" v-model:model-value="sNombreInput"></InputText>
    </div>

    <Button icon="pi pi-check" label="Agregar nueva unidad" fluid :disabled="sNombreInput.length == 0" @click="crearUnidad"></Button>
    </div>
  </div>
</template>