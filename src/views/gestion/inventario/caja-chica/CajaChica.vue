<script setup>
import Preloader from '@/components/Preloader.vue'
import { getCajaChica, insertCajaChicaValue } from '@/service/gestion/inventario/CajaChicaService'
import { handleServerError } from '@/utils/Util'
import { FilterMatchMode } from '@primevue/core/api'
import axios from 'axios'
import { useToast } from 'primevue'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { formatDate } from '@/utils/Util'

const store = useStore()
const id_sede = computed(() => store.getters.id_sede || "")
const caja_chica_data_stored = computed(() => store.getters.caja_chica_data)

const caja_chica_data = ref(caja_chica_data_stored.value)

const isPageLoading = ref(true)

const aItems = ref([])

const cancelToken = ref()

const toast = useToast()

const today_data = ref({
    ingresos: 0,
    egresos: 0,
    saldo_inicial: 0,
    total_cierre: 0
})

const filters = ref({})

const initFilters = () => {
    filters.value = {
        fecha: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
}

const resetFilters = () => initFilters()

const showOpenCaja = ref(false)
const aperturaCajaInput = ref(null)
const aperturaSubmittable = ref(false)

const checkIfSubmittable = (ev) => {
    const va = ev.value
    //console.log('check input', va)
    aperturaSubmittable.value = (va && va.toString().length > 0)
}

const aperturaCajaChica = async () => {
    showOpenCaja.value = false
    isPageLoading.value = true
    aperturaSubmittable.value = false
    try {
        const now = new Date().toDateString()
        const body = {
            tipo: 'Inicial',
            balance: parseFloat(today_data.value.saldo_inicial) + aperturaCajaInput.value,
            id_sede: id_sede.value,
            fecha: caja_chica_data.value.current_date.toString()
        }
        const response = await insertCajaChicaValue(body, 'i')
        caja_chica_data.value.is_opened = true
        cargarCajaChica()
    }
    catch (error) {
        isPageLoading.value = false
        handleServerError(error, 'Aperturar caja', toast)
    }
}

watch(caja_chica_data, (va) => {
    //console.log('caja chica data', va)
    store.dispatch('setCajaChicaData', caja_chica_data.value)
})

const showCurrentFilter = ref('Diario');
const filtersAvailable = ref([
    { value: 'Diario' },
    { value: 'Semanal' },
    { value: 'Mensual' }
]);

const filtroInput = ref(new Date());
const filtroGet = ref(new Date().getTime());

watch( showCurrentFilter, () => {
    filtroInput.value = null;
});

watch( filtroInput , (nuevo) => {
    if(!filtroInput.value) return;

    if( showCurrentFilter.value == "Semanal" )
    {
      filtroGet.value = filtroInput.value.map( f => f ? f.getTime() : null ).join("-");
      console.log("filtro",filtroGet.value)
      if( !filtroGet.value.includes('null') )
        cargarCajaChica()
      return;
    }

    filtroGet.value = filtroInput.value.getTime();
    console.log("filtro",filtroGet.value)

    cargarCajaChica()
});

const cargarCajaChica = async () => {
    isPageLoading.value = true
    try {
        var response = await getCajaChica(cancelToken.value.token, id_sede.value, "", showCurrentFilter.value, filtroGet.value)
        if (response) {
            console.log("response caja chica", response)
            // let ingresos = 0, egresos = 0
            // for (let i of response.ingresos) {
            //     console.log("I INGRESO", i)
            //     ingresos += parseFloat(i.total)
            // }
            // for (let i of response.egresos)
            //     egresos += parseFloat(i.balance)

            // today_data.value = { ingresos, egresos, total_cierre: ingresos - egresos }

            // aItems.value = [...response.ingresos, ...response.egresos]

            console.log('check response', response)
            response = response.filter(r => {
                if (r.comprobante != null) {
                    if (r.comprobante.fecha_anulado == null)
                        return true;
                    else
                        return false;
                }

                return true;
            })
            let today_inicial = 0, today_ingresos = 0, today_egresos = 0
            const group = {}
            for (let data of response) {

                const clave = `${data.sede.nombre}-${data.fecha}`
                if (!group[clave]) {
                    group[clave] = {
                        fecha: data.fecha,
                        sede: data.sede,
                        ingresos: 0,
                        egresos: 0,
                        saldo_inicial: 0,
                        total_cierre: 0,
                        motivo: data.motivo
                    }
                }

                data.balance = parseFloat(data.balance)

                switch (data.tipo) {
                    case 'Inicial':
                        group[clave].saldo_inicial = data.balance
                        break;
                    case 'Ingreso':
                        group[clave].ingresos += data.balance
                        break;
                    case 'Egreso':
                        group[clave].egresos += data.balance
                        break;
                }

                switch (data.tipo) {
                    case 'Inicial':
                        //console.log('update inicial', data.balance)
                        today_inicial = data.balance
                        break;
                    case 'Ingreso':
                        today_ingresos += data.balance
                        break;
                    case 'Egreso':
                        today_egresos += data.balance
                        break;
                }
                // if (parseInt(data.fecha) == caja_chica_data.value.current_date) {
                //     caja_chica_data.value.is_opened = true
                // }
            }
            today_data.value = {
                ingresos: today_ingresos,
                egresos: today_egresos,
                saldo_inicial: today_inicial,
                total_cierre: (today_inicial + today_ingresos) - today_egresos
            }

            // caja_chica_data.value = {
            //     ...caja_chica_data.value,
            //     current_balance: today_data.value.total_cierre
            // }

            //console.log('chek today', today_inicial, today_ingresos, today_egresos, today_data.value)

            for (let f in group) {
                const d = group[f]
                d.total_cierre = (d.saldo_inicial + d.ingresos) - d.egresos
            }

            if (caja_chica_data.value.last_record && !caja_chica_data.value.is_opened)
                today_data.value.saldo_inicial = caja_chica_data.value.last_record.tipo == 'Terminal' ? caja_chica_data.value.last_record.balance : 0

            aItems.value = response
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
    <Dialog v-model:visible="showOpenCaja" :show-header="false" modal :draggable="false" :closable="false"
        class="pt-4 md:w-[450px]">
        <p class="text-2xl font-bold text-secondary">Apertura Caja Chica</p>
        <label for="apertura_balance" class="block font-bold mb-3">
            Balance agregado
            <i class="pi pi-info-circle"
                v-tooltip.top="{ value: 'Balance que se agrega al \'Saldo Inicial\' para iniciar con un nuevo monto' }"></i>
        </label>
        <InputNumber id="apertura_balance" v-model:model-value="aperturaCajaInput" mode="currency" currency="PEN"
            locale="es-PE" fluid @input="checkIfSubmittable">
        </InputNumber>
        <div class="grid grid-cols-4 gap-4 mt-4">
            <Button class="col-span-4 md:col-span-2" icon="pi pi-times" label="Cancelar" outlined fluid
                @click="showOpenCaja = false"></Button>
            <Button class="col-span-4 md:col-span-2" icon="pi pi-check" label="Guardar" fluid
                @click="aperturaCajaChica"></Button>
        </div>
    </Dialog>
    <div class="card">
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <div class="text-2xl font-bold text-secondary m-0">Filtros</div>
            </div>
            <div class="grid grid-cols-12 gap-6 items-center">
                <div class="col-span-12 md:col-span-4 flex flex-col gap-3">
                    <label for="current_filter" class="block font-bold">Filtro</label>
                    <Select v-model:model-value="showCurrentFilter" :options="filtersAvailable" optionLabel="value"
                        option-value="value" placeholder="Seleccione un filtro" fluid></Select>
                </div>
                <div class="col-span-12 md:col-span-4 flex flex-col gap-3" v-if="showCurrentFilter == 'Diario'">
                    <label for="diario_filter" class="block font-bold">Fecha</label>
                    <DatePicker id="diario_filter" v-model="filtroInput" date-format="dd/mm/yy"></DatePicker>
                </div>
                <div class="col-span-12 md:col-span-4 flex flex-col gap-3" v-if="showCurrentFilter == 'Semanal'">
                    <label for="semanal_filter" class="block font-bold">Rango</label>
                    <DatePicker id="semanal_filter" v-model="filtroInput" selectionMode="range" :manualInput="false"></DatePicker>
                </div>
                <div class="col-span-12 md:col-span-4 flex flex-col gap-3" v-if="showCurrentFilter == 'Mensual'">
                    <label for="mensual_filter" class="block font-bold">Mes</label>
                    <DatePicker id="mensual_filter" v-model="filtroInput" view="month" dateFormat="mm/yy"></DatePicker>
                </div>
            </div>
        </div>
    </div>
    <div class="card relative overflow-hidden" v-if="id_sede != ''">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <div class="flex gap-4">
                <p class="text-2xl font-bold text-secondary m-0">Caja</p>
                <!-- <Button label="Aperturar caja" @click="showOpenCaja = true" :disabled="caja_chica_data.is_opened"
                    v-tooltip.top="{ value: 'La caja ya se encuentra abierta', disabled: !caja_chica_data.is_opened }"></Button> -->

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

                <!-- <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Saldo inicial</p>
                    <p>S/. {{ parseFloat(today_data.saldo_inicial).toFixed(2) }}</p>
                </div> -->
                <div class="card !p-5 !m-0 border col-span-4 sm:col-span-2 lg:col-span-1">
                    <p class="text-lg font-bold text-primary'">Total</p>
                    <p>S/. {{ parseFloat(today_data.total_cierre).toFixed(2) }}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <p class="text-2xl font-bold text-secondary m-0">Registro {{ id_sede == '' ? 'de Caja' : '' }}</p>
            <DataTable :value="aItems" removable-sort table-style="min-width: 30rem" show-gridlines
                v-model:filters="filters" :rows="10" paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} registros">

                <!-- <template #header>
                    <Button label="Borrar filtros" icon="pi pi-filter-slash" @click="resetFilters()" outlined></Button>
                </template> -->

                <Column field="id" header="#" sortable>
                    <template #body="item">{{ item.index + 1 }}</template>
                </Column>

                <Column field="sede.nombre" header="Sede" sortable style="min-width: 8rem" v-if="id_sede == ''">
                </Column>

                <Column field="fecha" header="Fecha de cierre" sortable :show-filter-menu="false">
                    <template #body="item">{{ formatDate(item.data.fecha) }}</template>
                </Column>
                <Column field="motivo" header="Motivo" :show-filter-menu="false"></Column>
                <Column field="tipo" header="Tipo" :show-filter-menu="false"></Column>
                <Column field="balance" header="Balance" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.balance).toFixed(2) }}</template>
                </Column>
                <!-- <Column field="egresos" header="Egresos" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.egresos).toFixed(2) }}</template>
                </Column>
                <Column field="total_cierre" header="Total cierre" sortable>
                    <template #body="item">S/. {{ parseFloat(item.data.total_cierre).toFixed(2) }}</template>
                </Column> -->
            </DataTable>
        </div>
    </div>
</template>