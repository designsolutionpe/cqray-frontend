<script setup>
import Preloader from '@/components/Preloader.vue'
import { getCajaChica } from '@/service/gestion/inventario/CajaChicaService'
import { handleServerError } from '@/utils/Util'
import axios from 'axios'
import { useToast } from 'primevue'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const id_sede = computed(() => store.getters.id_sede || "")
const id_check_sede = computed(() => store.getters.id_sede)

const isPageLoading = ref(true)

const aItems = ref([])

const cancelToken = ref()

const toast = useToast()

const today_data = ref({
    ingresos: 0,
    egresos: 0,
    saldo_inicial: 0,
    total: 0
})

const cargarCajaChica = async () => {
    isPageLoading.value = true
    try {
        const response = await getCajaChica(cancelToken.value.token, id_sede.value)
        if (response) {
            const group = {}

            response.forEach(i => {
                const fecha = i.fecha
                const sede = i.sede
                const balance = parseFloat(i.balance)

                if (!group[fecha]) {
                    group[fecha] = {
                        fecha,
                        sede,
                        ingresos: 0,
                        egresos: 0,
                        saldo_inicial: 0,
                        total_cierre: 0
                    }
                }

                if (i.tipo == "Ingreso")
                    group[fecha].ingresos += balance
                else if (i.tipo == "Egreso")
                    group[fecha].egresos += balance

                if (i.flg_inicial)
                    group[fecha].saldo_inicial = balance
            })

            for (let f in group) {
                const d = group[f]
                d.total_cierre = (d.saldo_inicial + d.ingresos) - d.egresos

                if (new Date(f) == new Date())
                    today_data.value = { ingresos: d.ingresos, egresos: d.egresos }
            }

            aItems.value = Object.values(group)

            console.log("check", aItems.value)
        }
        isPageLoading.value = false
    }
    catch (error) {
        isPageLoading.value = false
        handleServerError(error, "Cargar Caja Chica", toast)
    }
}

onBeforeMount(() => {
    cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarCajaChica()
})

onBeforeUnmount(() => {
    cancelToken.value.cancel()
})
</script>
<template>
    <div class="card relative overflow-hidden" v-if="id_sede != ''">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <p class="text-2xl font-bold text-secondary m-0">Caja Chica</p>
                <Button label="Aperturar caja"></Button>
            </div>
            <div class="grid grid-cols-4 gap-6 items-center">
                <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Ingresos</p>
                    <p>S/. {{ parseFloat(today_data.ingresos).toFixed(2) }}</p>
                </div>
                <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Egresos</p>
                    <p>S/. {{ parseFloat(today_data.egresos).toFixed(2) }}</p>
                </div>

                <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Saldo inicial</p>
                    <p>S/. {{ parseFloat(today_data.ingresos).toFixed(2) }}</p>
                </div>
                <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Total</p>
                    <p>S/. {{ parseFloat(today_data.egresos).toFixed(2) }}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <p class="text-2xl font-bold text-secondary m-0">Registro {{ id_sede == '' ? 'de Caja Chica' : '' }}</p>
            <DataTable :value="aItems" removable-sort table-style="min-width: 30rem" show-gridlines>
                <Column field="id" header="#" sortable>
                    <template #body="item">{{ item.index + 1 }}</template>
                </Column>

                <Column field="sede.nombre" header="Sede" sortable style="min-width: 8rem" v-if="id_sede == ''">
                </Column>

                <Column field="fecha" header="Fecha de cierre" sortable></Column>
                <Column field="ingresos" header="Ingresos" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.ingresos).toFixed(2) }}</template>
                </Column>
                <Column field="egresos" header="Egresos" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.egresos).toFixed(2) }}</template>
                </Column>
                <Column field="total_cierre" header="Total cierre" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.total_cierre).toFixed(2) }}</template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
