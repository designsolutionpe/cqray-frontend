<script setup>
  import { ref, onBeforeMount,onMounted, onBeforeUnmount } from 'vue'
  import { getArticulosServicios } from '@/service/mantenimiento/ArticulosService'
  import axios from 'axios'
  import { useToast } from 'primevue'
  import { handleServerError } from '@/utils/Util'

  const props = defineProps({
    isPageLoading: {
      type: Boolean,
      required: true
    }
  })

  const cancelToken = ref()

  const toast = useToast()

  const aServicios = ref([])
  const aServiciosSelect = ref([])

  const nServiceSelected = ref(null)

  const cargarPaquetes = async () => {
   props.isPageLoading.value = true
   try
   {
    const response = await getArticulosServicios(cancelToken.value.token)
    console.log("paquetea",response);
    if(response)
    {
      aServicios.value = response
      aServiciosSelect.value = response.map( s => ({
        label: s.nombre,
        value: s.id
      }) )
    }
    props.isPageLoading.value = false
   }
   catch(error)
   {
    props.isPageLoading.value = false
    handleServerError(error,"Obtener paquetes",toast)
   }
  }

  onBeforeMount(()=>{
    cancelToken.value = axios.CancelToken.source()
  })

  onMounted(()=>{
    cargarPaquetes()
  })

  onBeforeUnmount(()=>{
    cancelToken.value.cancel()
  })
</script>
<template>
  <div>
    <div class="flex flex-col gap-4">
      <label for="servicio" class="block font-bold">Servicio</label>
      <Select id="servicio" v-model:model-value="nServicioSelected" :options="aServiciosSelect" option-label="label" option-value="value" placeholder="Seleccione el paquete" fluid></Select>
    </div>
  </div>
</template>
