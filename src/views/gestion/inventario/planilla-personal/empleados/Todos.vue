<script setup>
import Preloader from '@/components/Preloader.vue';
import { getEmpleados } from '@/service/gestion/inventario/EmpleadoService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const id_sede = computed(() => store.getters.id_sede)

const isEmpleadosLoading = ref(true)
const isPageLoading = ref(true)

watch(
    [isEmpleadosLoading],
    ([empleados]) => {
        isPageLoading.value = (empleados)
    }
)

const cancelToken = ref()
const toast = useToast()

const aItems = ref([])

const cargarEmpleados = async () => {
    isEmpleadosLoading.value = true
    try {
        const response = await getEmpleados(cancelToken.value.token, id_sede.value)
        if (response) {
            console.log('data', response)
            aItems.value = response
        }
        isEmpleadosLoading.value = false
    }
    catch (error) {
        isEmpleadosLoading.value = false
        handleServerError(error, 'Empleados', toast)
    }
}

onBeforeMount(() => {
    cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarEmpleados()
})

onBeforeUnmount(() => {
    cancelToken.value.cancel()
})

</script>
<template>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <p class="text-2xl font-bold text-secondary">Empleados</p>
            <DataTable :value="aItems" show-gridlines removable-sort table-style="min-width: 30rem" :rows="10" paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} empleados">
                <template #header>
                    <Button label="Nuevo empleado" icon="pi pi-plus" @click="null"></Button>
                </template>

                <Column field="persona.nombre" header="Nombre" sortable style="min-width: 15rem"></Column>
                <Column field="persona.apellido" header="Apellido" sortable style="min-width: 15rem"></Column>
                <Column field="ocupacion" header="Ocupacion" sortable style="min-width: 10rem"></Column>
                <Column field="persona.numero_documento" header="DNI/C.E/etc" sortable style="min-width: 10rem">
                </Column>
                <Column field="sueldo" header="Sueldo Bruto" sortable style="min-width: 8rem"></Column>
                <Column field="is_planilla" header="Planilla" sortable style="min-width: 8rem">
                    <template #body="item">
                        {{
                            item.data.is_planilla ?
                                '<i class="pi pi-check"></i>' :
                                '<iclass="pi pi-times"></i>'
                        }}
                    </template>
                </Column>
                <Column field="tipo_seguro.nombre" header="Tipo de seguro" sortable style="min-width: 15rem"></Column>
            </DataTable>
        </div>
    </div>
</template>