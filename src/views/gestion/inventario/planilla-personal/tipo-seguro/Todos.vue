<script setup>
import AgregarTipoSeguro from '@/components/dialogs/gestion/inventario/planilla-personal/tipo-seguros/AgregarTipoSeguro.vue';
import EditarTipoSeguro from '@/components/dialogs/gestion/inventario/planilla-personal/tipo-seguros/EditarTipoSeguro.vue';
import Preloader from '@/components/Preloader.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import { deleteTipoSeguro, getTipoSeguros } from '@/service/gestion/inventario/TipoSeguroService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const aTiposSegurosData = ref([])

const toast = useToast()

const isTiposSegurosLoading = ref(true)
const isPageLoading = ref(true);

const cancelToken = ref()

const cargarTiposSeguros = async () => {
  isTiposSegurosLoading.value = true
  try {
    const response = await getTipoSeguros(cancelToken.value.token)
    if (response) {
      console.log('get items', response)
      aTiposSegurosData.value = response
    }
    isTiposSegurosLoading.value = false
  }
  catch (error) {
    isTiposSegurosLoading.value = false
    handleServerError(error, 'Tipos seguros', toast)
  }
}

watch(
  [isTiposSegurosLoading],
  ([tiposseguros]) => {
    isPageLoading.value = (tiposseguros)
  }
)

const agregarDialogRef = ref()
const editarDialogRef = ref()
const YesNoDialogRef = ref()

const onShowNewTipoSeguroDialog = () => {
  agregarDialogRef.value.onShowNewTipoSeguroDialog()
}

const onShowEditTipoSeguroDialog = (data) => {
  editarDialogRef.value.onShowEditTipoSeguroDialog(data)
}

const nIdDeleteTipoSeguro = ref(null)
const onActiveDeleteDialog = (id) => {
  nIdDeleteTipoSeguro.value = id
  YesNoDialogRef.value.showDialog()
}
const onDeleteTipoSeguro = async () => {
  if (nIdDeleteTipoSeguro.value == null) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se ha seleccionado correctamente el tipo de seguro a eliminar',
      life: 3000
    });
    return
  }

  try {
    const response = await deleteTipoSeguro(nIdDeleteTipoSeguro.value)
    toast.add({
      severity: 'success',
      summary: 'Operación exitosa',
      detail: 'Se ha eliminado el tipo de seguro con exito',
      life: 3000
    });
    onAfterEventsTipoSeguro()
  }
  catch (error) {
    isPageLoading.value = false
    handleServerError(error, 'ELiminar tipo seguro', toast)
  }
}

const onAfterEventsTipoSeguro = () => {
  cargarTiposSeguros()
}

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarTiposSeguros()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary m-0">Tipo de Seguros</p>
      <DataTable :value="aTiposSegurosData" removable-sort table-style="min-width: 30rem" show-gridlines :rows="10"
        paginator paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} seguros registrados">
        <template #header>
          <Button label="Nuevo tipo de seguro" icon="pi pi-plus" @click="onShowNewTipoSeguroDialog"></Button>
        </template>

        <Column field="tipo" header="Tipo" sortable style="min-width: 8rem"></Column>
        <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>
        <Column field="snp" header="SNP (%)" sortable style="min-width: 5rem">
          <template #body="item">{{ item.data.snp || '--' }}</template>
        </Column>
        <Column field="aporte" header="Aporte oblig. AFP (%)" sortable style="min-width: 8rem;">
          <template #body="item">{{ item.data.aporte || '--' }}</template>
        </Column>
        <Column field="invalidez" header="Invalidez y sobr. (%)" sortable style="min-width: 8rem;">
          <template #body="item">{{ item.data.invalidez || '--' }}</template>
        </Column>
        <Column field="comision" header="Comisión AFP (%)" sortable style="min-width: 8rem;">
          <template #body="item">{{ item.data.comision || '--' }}</template>
        </Column>

        <Column :exportable="false" style="min-width: 12rem;" header="Acciones" frozen>
          <template #body="item">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" v-tooltip.top="{ value: 'Editar' }"
              @click="onShowEditTipoSeguroDialog(item.data)"></Button>
            <Button icon="pi pi-trash" severity="danger" outlined rounded class="mr-2"
              v-tooltip.top="{ value: 'Eliminar' }" @click="onActiveDeleteDialog(item.data.id)"></Button>
          </template>
        </Column>

      </DataTable>
    </div>
  </div>

  <!-- Dialogs -->
  <YesNoDialog ref="YesNoDialogRef" title="¿Deseas eliminar este tipo de seguro?" v-on:affirmation="onDeleteTipoSeguro">
  </YesNoDialog>
  <AgregarTipoSeguro ref="agregarDialogRef" v-on:after-callback="onAfterEventsTipoSeguro"></AgregarTipoSeguro>
  <EditarTipoSeguro ref="editarDialogRef" v-on:after-callback="onAfterEventsTipoSeguro"></EditarTipoSeguro>
</template>