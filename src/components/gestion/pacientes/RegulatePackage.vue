<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  aServicios: {
    type: Array,
    required: true
  },
  nEstadoPaciente: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['updateExtraInfo'])

const store = useStore()
const id_sede = computed(()=> store.getters.id_sede )

const aServicios = ref([])
const aServiciosSelect = ref([])
const nServiceSelected = ref(null)

const nQuantity = ref(null)
const nMaxQuantity = ref(1)
const bDisableMax = ref(true)

const oDateInit = ref(null)

const getMaxQuantity = () => {
  console.log('max quantity', aServicios.value)
  if (aServicios.value.length > 0) {
    const q = aServicios.value.find(q => q.id === nServiceSelected.value)
    console.log('paquete max', q)
    nMaxQuantity.value = q.cantidad
  }
  else nMaxQuantity.value = 1
}

watch(
  [
    nServiceSelected,
    nQuantity
  ],
  ([
    paquete,
    quantity
  ]) => {
    bDisableMax.value = false
    getMaxQuantity()
    console.log('quanity', quantity)
    emit('updateExtraInfo', {
      paquete,
      quantity,
    })
  }
)

watch(
  () => [props.nEstadoPaciente, aServicios.value],
  ([estado]) => {
    bDisableMax.value = true
    console.log("id_sede",id_sede.value)
    aServiciosSelect.value = aServicios.value.filter(s => (s.id_estado_paciente === estado) && (id_sede.value ? s.id_sede == id_sede.value : true)).map(s => ({
      label: s.nombre,
      value: s.id
    }))
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  aServicios.value = props.aServicios
})

</script>
<template>
  <div class="flex flex-col gap-4">
    <div>
      <label for="servicio" class="block font-bold mb-3">Servicio</label>
      <Select id="servicio" v-model:model-value="nServiceSelected" :options="aServiciosSelect" option-label="label"
        option-value="value" placeholder="Seleccione el paquete" fluid></Select>
    </div>
    <div>
      <label for="quantity" class="block font-bold mb-3">Sesion actual</label>
      <InputNumber fluid :use-grouping="false" v-model:model-value="nQuantity" :placeholder="'Max: ' + nMaxQuantity"
        :max="nMaxQuantity" :min="1" :disabled="bDisableMax"></InputNumber>
    </div>
    <div>
      <label for="fecha_inicio" class="block font-bold mb-3">Fecha de inicio</label>
      <DatePicker v-model:model-value="oDateInit" date-format="dd/mm/yy" placeholder="dd/mm/yyyy" fluid></DatePicker>
    </div>
  </div>
</template>
