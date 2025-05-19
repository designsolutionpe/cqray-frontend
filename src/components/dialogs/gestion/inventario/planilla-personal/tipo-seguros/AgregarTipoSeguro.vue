<script setup>
import { createTipoSeguro } from '@/service/gestion/inventario/TipoSeguroService';
import { handleServerError } from '@/utils/Util';
import { useToast } from 'primevue';
import { ref } from 'vue';

const props = defineProps({
  onAfterCallback: {
    type: Function,
    required: true
  }
})

const oTipoSeguroData = ref({
  nombre: null,
  tipo: null
})

const toast = useToast()

const aTiposSegurosSelect = ref([
  { value: 'SNP', label: 'SNP' },
  { value: 'AFP', label: 'AFP' },
])

const onTypeChangeListener = () => {
  oTipoSeguroData.value = {
    ...oTipoSeguroData.value,
    snp: null,
    aporte: null,
    invalidez: null,
    comision: null
  }
}

const showNewTipoSeguroDialog = ref(false)

const onShowNewTipoSeguroDialog = () => {
  showNewTipoSeguroDialog.value = true
}

const onHideNewTipoSeguroDialog = () => {
  showNewTipoSeguroDialog.value = false
}

const errorChecks = () => {
  let message = ''
  switch (true) {
    case oTipoSeguroData.value.tipo == null:
      message = 'Seleccione un tipo de seguro'
      break;
    case oTipoSeguroData.value.nombre == null:
    case oTipoSeguroData.value.nombre.trim().length == 0:
      message = 'Asignele un nombre'
      break;
    case
      oTipoSeguroData.value.tipo == 'SNP' &&
      !oTipoSeguroData.value.snp &&
      oTipoSeguroData.value.snp == null:
      message = 'Asignele un valor a SNP'
      break;
    case
      oTipoSeguroData.value.tipo == 'AFP' &&
      !oTipoSeguroData.value.aporte &&
      oTipoSeguroData.value.aporte == null:
      message = 'Asignele un valor a Aporte obligatorio AFP'
      break;
    case
      oTipoSeguroData.value.tipo == 'AFP' &&
      !oTipoSeguroData.value.invalidez &&
      oTipoSeguroData.value.invalidez == null:
      message = 'Asignele un valor a Invalidez y sobrevivencia'
      break;
    case
      oTipoSeguroData.value.tipo == 'AFP' &&
      !oTipoSeguroData.value.comision &&
      oTipoSeguroData.value.comision == null:
      message = 'Asignele un valor a Comisión AFP'
      break;
    default:
      return false;
  }
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 3000
  });
  return true;
}

const resetFields = () => {
  oTipoSeguroData.value = {
    nombre: null,
    tipo: null
  }
}

const onCreateTipoSeguro = async () => {
  if (errorChecks()) return
  showNewTipoSeguroDialog.value = false
  try {
    const response = await createTipoSeguro(oTipoSeguroData.value)
    toast.add({
      severity: 'success',
      summary: 'Operación exitosa',
      detail: 'Se ha creado el tipo de seguro con exito',
      life: 3000
    });
    resetFields()
    props.onAfterCallback()
  }
  catch (error) {
    handleServerError(error, 'crear tipo seguro', toast)
  }
}

defineExpose({
  onShowNewTipoSeguroDialog
})

</script>
<template>

  <Dialog v-model:visible="showNewTipoSeguroDialog" :show-header="false" modal :draggable="false" :closable="false"
    class="pt-4 md:w-[450px]">
    <p class="text-2xl font-bold text-secondary">Agregar nuevo tipo de seguro</p>
    <div class="flex flex-col gap-4">
      <div>
        <label for="tipo_seguro" class="block font-bold mb-3">Tipo de seguro</label>
        <Select id="tipo_seguro" v-model="oTipoSeguroData.tipo" :options="aTiposSegurosSelect" option-label="label"
          option-value="value" placeholder="Seleccione el tipo de seguro" fluid
          @value-change="onTypeChangeListener"></Select>
      </div>
      <div>
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText id="nombre" type="text" v-model:model-value="oTipoSeguroData.nombre" fluid>
        </InputText>
      </div>
      <div>
        <label for="snp" class="block font-bold mb-3">SNP (%)</label>
        <InputNumber id="snp" v-model:model-value="oTipoSeguroData.snp" fluid suffix="%" :min="0" :max="100"
          :disabled="oTipoSeguroData.tipo != 'SNP'"></InputNumber>
      </div>
      <div>
        <label for="aporte" class="block font-bold mb-3">Aporte obligatorio AFP (%)</label>
        <InputNumber id="aporte" v-model:model-value="oTipoSeguroData.aporte" :min-fraction-digits="2"
          :max-fraction-digits="2" fluid suffix="%" :min="0" :max="100" :disabled="oTipoSeguroData.tipo != 'AFP'">
        </InputNumber>
      </div>
      <div>
        <label for="invalidez" class="block font-bold mb-3">Invalidez y sobrevivencia (%)</label>
        <InputNumber id="invalidez" v-model:model-value="oTipoSeguroData.invalidez" :min-fraction-digits="2"
          :max-fraction-digits="2" fluid suffix="%" :min="0" :max="100" :disabled="oTipoSeguroData.tipo != 'AFP'">
        </InputNumber>
      </div>
      <div>
        <label for="comision" class="block font-bold mb-3">Comisión AFP (%)</label>
        <InputNumber id="comision" v-model:model-value="oTipoSeguroData.comision" :min-fraction-digits="2"
          :max-fraction-digits="2" fluid suffix="%" :min="0" :max="100" :disabled="oTipoSeguroData.tipo != 'AFP'">
        </InputNumber>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <Button label="Cancelar" icon="pi pi-times" @click="onHideNewTipoSeguroDialog" fluid outlined
          class="col-span-4 md:col-span-2"></Button>
        <Button label="Agregar" icon="pi pi-check" @click="onCreateTipoSeguro" fluid
          class="col-span-4 md:col-span-2"></Button>
      </div>
    </div>
  </Dialog>

</template>