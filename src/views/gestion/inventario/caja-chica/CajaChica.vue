<script setup>
    import { getCajaChica } from '@/service/gestion/inventario/CajaChicaService'
    import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
    import { useStore } from 'vuex'
    import { useToast } from 'primevue'
    import axios from 'axios'
    import { handleServerError } from '@/utils/Util'
    import Preloader from '@/components/Preloader.vue'

    const store = useStore()
    const id_sede = computed(()=> store.getters.id_sede || "")

    const isPageLoading = ref(true)

    const aItems = ref([])

    const cancelToken = ref()

    const toast = useToast()

    const today_data = ref({
        ingresos: 0,
        egresos: 0
    })

    const cargarCajaChica = async () => {
        isPageLoading.value = true
        try
        {
            const response = await getCajaChica(cancelToken.value.token,id_sede.value)
            if( response )
            {
                const group = {}

                response.forEach( i => {
                    const fecha = i.fecha
                    const balance = parseFloat(i.balance)

                    if(!group[fecha]){
                        group[fecha] = {
                            fecha,
                            ingresos: 0,
                            egresos: 0,
                            saldo_inicial: 0,
                            total_cierre: 0
                        }
                    }

                    if( i.tipo == "Ingreso" )
                        group[fecha].ingresos += balance
                    else if( i.tipo == "Egreso" )
                        group[fecha].egresos += balance

                    if( i.flg_inicial )
                        group[fecha].saldo_inicial = balance
                })

                for( let f in group )
                {
                    const d = group[f]
                    d.total_cierre = ( d.saldo_inicial + d.ingresos ) - d.egresos

                    if( new Date(f) == new Date() )
                        today_data.value = { ingresos: d.ingresos, egresos: d.egresos }
                }

                aItems.value = Object.values(group)

                console.log("check",aItems.value)
            }
            isPageLoading.value = false
        }
        catch(error)
        {
            isPageLoading.value = false
            handleServerError(error,"Cargar Caja Chica",toast)
        }
    }

    onBeforeMount(()=>{
        cancelToken.value = axios.CancelToken.source()
    })

    onMounted(()=>{
        cargarCajaChica()
    })

    onBeforeUnmount(()=>{
        cancelToken.value.cancel()
    })
</script>
<template>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <p class="text-2xl font-bold text-secondary">Caja Chica</p>
            <div class="grid grid-cols-4">
                <div class="card border col-span-4">
                    <p class="text-lg font-bold text-secondary">Ingresos</p>
                    <p>S/. {{ parseFloat(today_data.ingresos).toFixed(2) }}</p>
                </div>
                <div class="card border col-span-4">
                    <p class="text-lg font-bold text-secondary">Egresos</p>
                    <p>S/. {{ parseFloat(today_data.egresos).toFixed(2) }}</p>
                </div>
            </div>
            <DataTable :value="aItems" removable-sort table-style="min-width: 30rem" show-gridlines>
                <Column field="id" header="#" sortable>
                    <template #body="item">{{ item.index + 1 }}</template>
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
