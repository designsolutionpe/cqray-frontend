<script setup>
import Preloader from '@/components/Preloader.vue'
import { getCajaChica, insertCajaChicaValue } from '@/service/gestion/inventario/CajaChicaService'
import { handleServerError } from '@/utils/Util'
import axios from 'axios'
import { useToast } from 'primevue'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

const isEgresosLoading = ref(true)
const isPageLoading = ref(true)

watch(
    [
        isEgresosLoading
    ],
    ([egresos]) => {
        isPageLoading.value = (egresos)
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

const showCreateOutcome = ref(false)

const outcomeInput = ref(null)
const reasonInput = ref(null)
const fechaInput = ref(null)

watch( showCreateOutcome , (opened) => {
    if(opened)
        fechaInput.value = new Date()
})

const showCurrentFilter = ref(null)
const aFilterOptions = ref([
    { value: "Diario" }
    { value: "Semanal" }
    { value: "Mensual" }
])

const filtroInput = ref(new Date())
const filtroGet = ref(null)

watch( showCurrentFilter, (filter) => {
    switch( filter )
    {
        case "Semanal":
            filtroInput.value = null
            break;
        default:
            filtroInput.value = new Date()
    }
})

watch( filtroInput , (n) => {
})

const cargarEgresos = async () => {
    isEgresosLoading.value = true
    try {
        const response = await getCajaChica(cancelToken.value.token, id_sede.value, 'Egreso')

        if (response) {
            //console.log(response)
            aItems.value = response
        }

        isEgresosLoading.value = false
    }
    catch (error) {
        isEgresoLoading.value = false
        handleServerError(error, "Obteniendo egresos", toast)
    }
}

const onCreateOutcome = async () => {
    isPageLoading.value = true
    try {
        //console.log('check neuvo egreso', outcomeInput.value, caja_chica_data.value.current_balance)
        /*if (outcomeInput.value > caja_chica_data.value.current_balance) {
            toast.add({
                severity: 'error',
                summary: 'No se puede ingresar un valor que supere el balance actual: ' + caja_chica_data.value.current_balance,
                life: 5000
            })
            isPageLoading.value = false
            return
        }*/

        const body = {
            tipo: 'Egreso',
            balance: outcomeInput.value,
            id_sede: id_sede.value,
            fecha: fechaInput.value.toISOString(),
            motivo: reasonInput.value
        }

        console.log("egreso",body)

        const response = await insertCajaChicaValue(body)
        /*caja_chica_data.value = {
            ...caja_chica_data.value,
            current_balance: caja_chica_data.value.current_balance - outcomeInput.value
        }*/
        showCreateOutcome.value = false
        cargarEgresos()
    }
    catch (error) {
        isPageLoading.value = false
        handleServerError(error, "Registrar egreso", toast)
    }
}

onBeforeMount(() => {
    cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarEgresos()
})

onBeforeUnmount(() => {
    cancelToken.value.cancel()
})

</script>
<template>
    <Dialog v-model:visible="showCreateOutcome" :show-header="false" modal :draggable="false" :closable="false"
        class="pt-4">
        <p class="text-xl font-bold text-secondary m-0 mb-4">Nuevo Egreso</p>
        <div class="grid grid-cols-4 gap-4 mb-4">
            <label for="balance" class="col-span-4 block font-bold">Balance</label>
        <InputNumber id="balance" class="col-span-4" v-model:model-value="outcomeInput" fluid mode="currency" currency="PEN" locale="es-PE">
        </InputNumber>
        </div>
        <div class="grid grid-cols-4 gap-4 mb-4">
            <label for="motivo" class="col-span-4 block font-bold">Motivo</label>
            <InputText id="motivo" class="col-span-4" v-model:model-value="reasonInput"></InputText>
        </div>
        <div class="grid grid-cols-4 gap-4 mb-4">
            <label for="fecha" class="col-span-4 block font-bold">Fecha</label>
            <DatePicker dateFormat="dd/mm/yy" id="fecha" class="col-span-4" v-model="fechaInput"></DatePicker>
        </div>
        <div class="col-span-4 grid grid-cols-4 gap-4">
            <Button class="col-span-4 md:col-span-2" outlined icon="pi pi-times" label="Cancelar"
                @click="showCreateOutcome = false"></Button>
            <Button class="col-span-4 md:col-span-2" icon="pi pi-check" label="Guardar egreso"
                @click="onCreateOutcome"></Button>
        </div>
    </Dialog>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <p class="text-2xl font-bold text-secondary m-0">Egresos</p>
                <Button icon="pi pi-plus" label="Nuevo egreso"
                     @click="showCreateOutcome = true"></Button>
            </div>
            <DataTable :value="aItems" table-style="30rem" show-gridlines removable-sort>
                <Column field="id" header="#" sortable style="min-width: 1rem">
                    <template #body="item">{{ item.index + 1 }}</template>
                </Column>

                <Column field="sede.nombre" header="Sede" style="min-width: 6rem" v-if="!id_sede"></Column>

                <Column field="fecha" header="Fecha" style="min-width: 5rem">
                    <template #body="item">{{ new Date(item.data.fecha).toLocaleDateString() }}</template>
                </Column>
                <Column field="motivo" header="Motivo" style="min-width: 5rem"></Column>
                <Column field="balance" header="Monto" style="min-width: 5rem">
                    <template #body="item">S/. {{ parseFloat(item.data.balance).toFixed(2) }}</template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>