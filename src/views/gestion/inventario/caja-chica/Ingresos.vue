<script setup>
import Preloader from '@/components/Preloader.vue'
import { getCajaChica, insertCajaChicaValue } from '@/service/gestion/inventario/CajaChicaService'
import { handleServerError } from '@/utils/Util'
import axios from 'axios'
import { useToast } from 'primevue'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

const isIngresosLoading = ref(true)
const isPageLoading = ref(true)

watch(
    [
        isIngresosLoading
    ],
    ([ingresos]) => {
        isPageLoading.value = (ingresos)
    }
)

const store = useStore()
const id_sede = computed(() => store.getters.id_sede || "")
const caja_chica_data_stored = computed(() => store.getters.caja_chica_data)

const caja_chica_data = ref(caja_chica_data_stored.value)

watch(caja_chica_data, (va) => {
    //console.log('caja chica data', va)
    store.dispatch('setCajaChicaData', caja_chica_data.value)
})

const toast = useToast()
const cancelToken = ref()

const aItems = ref([])

const isCajaOpened = ref(false)

const showCreateIncome = ref(false)

const incomeInput = ref(null)

const cargarIngresos = async () => {
    isIngresosLoading.value = true
    try {
        const response = await getCajaChica(cancelToken.value.token, id_sede.value, "Ingreso")

        if (response) {
            //console.log(response)
            aItems.value = response
        }

        isIngresosLoading.value = false
    }
    catch (error) {
        isIngresoLoading.value = false
        handleServerError(error, "Obteniendo ingresos", toast)
    }
}

const onCreateIncome = async () => {
    isPageLoading.value = true
    try {
        const body = {
            tipo: 'Ingreso',
            balance: incomeInput.value,
            id_sede: id_sede.value,
            fecha: caja_chica_data.value.current_date.toString()
        }

        const response = await insertCajaChicaValue(body)
        caja_chica_data.value = {
            ...caja_chica_data.value,
            current_balance: caja_chica_data.value.current_balance + incomeInput.value
        }
        showCreateIncome.value = false
        cargarIngresos()
    }
    catch (error) {
        isPageLoading.value = false
        handleServerError(error, "Registrar ingreso", toast)
    }
}

onBeforeMount(() => {
    cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarIngresos()
})

onBeforeUnmount(() => {
    cancelToken.value.cancel()
})

</script>
<template>
    <Dialog v-model:visible="showCreateIncome" :show-header="false" modal :draggable="false" :closable="false"
        class="pt-4">
        <p class="text-xl font-bold text-secondary m-0">Nuevo ingreso</p>
        <InputNumber v-model:model-value="incomeInput" fluid mode="currency" currency="PEN" locale="es-PE">
        </InputNumber>
        <div class="grid grid-cols-4 gap-4">
            <Button class="col-span-4 md:col-span-2" outlined icon="pi pi-times" label="Cancelar"
                @click="showCreateIncome = false"></Button>
            <Button class="col-span-4 md:col-span-2" icon="pi pi-check" label="Guardar ingreso"
                @click="onCreateIncome"></Button>
        </div>
    </Dialog>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <p class="text-2xl font-bold text-secondary m-0">Ingresos</p>
                <Button icon="pi pi-plus" label="Nuevo ingreso"
                    v-tooltip.top="{ value: 'Debe abrir caja primero', disabled: caja_chica_data.is_opened }"
                    :disabled="!caja_chica_data.is_opened" @click="showCreateIncome = true"></Button>
            </div>
            <DataTable :value="aItems" table-style="30rem" show-gridlines removable-sort>
                <Column field="id" header="#" sortable style="min-width: 1rem">
                    <template #body="item">{{ item.index + 1 }}</template>
                </Column>

                <Column field="sede.nombre" header="Sede" style="min-width: 6rem"></Column>

                <Column field="fecha" header="Fecha" style="min-width: 5rem">
                    <template #body="item">{{ new Date(parseInt(item.data.fecha)).toLocaleDateString() }}</template>
                </Column>
                <Column field="balance" header="Monto" style="min-width: 5rem">
                    <template #body="item">S/. {{ parseFloat(item.data.balance).toFixed(2) }}</template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>