<script setup>
    import { ref, watch, computed, onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
    import { useToast } from 'primevue'
    import { useStore } from 'vuex'
    import axios from 'axios'
    import { handleServerError } from '@/utils/Util'
    import { getCajaChica } from '@/service/gestion/inventario/CajaChicaService'
    import Preloader from '@/components/Preloader.vue'

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
    const id_sede = computed(()=> store.getters.id_sede || "")

    const toast = useToast()
    const cancelToken = ref()

    const aItems = ref([])

    const cargarEgresos = async () => {
        isIngresosLoading.value = true
        try
        {
            const response = await getCajaChica(cancelToken.value.token,id_sede.value,"Egreso")

            if( response )
            {
                console.log(response)
                aItems.value = response.filter( i => !i.flg_terminal )
            }

            isIngresosLoading.value = false
        }
        catch(error)
        {
            isIngresoLoading.value = false
            handleServerError(error,"Obteniendo ingresos",toast)
        }
    }

    onBeforeMount(()=>{
        cancelToken.value = axios.CancelToken.source()
    })

    onMounted(()=>{
        cargarEgresos()
    })

    onBeforeUnmount(()=>{
        cancelToken.value.cancel()
    })

</script>
<template>
    <div class="card relative overflow-hidden">
        <Preloader v-if="isPageLoading"></Preloader>
        <div class="flex flex-col gap-4">
            <p class="text-2xl font-bold text-secondary">Egresos</p>
            <DataTable :value="aItems" table-style="30rem" show-gridlines removable-sort>
                <Column field="id" header="#" sortable style="min-width: 1rem">
                    <template #body="item">{{ item.index + 1 }}</template>
                </Column>

                <Column field="sede.nombre" header="Sede" style="min-width: 6rem"></Column>

                <Column field="fecha" header="Fecha" style="min-width: 5rem"></Column>
                <Column field="balance" header="Monto" style="min-width: 5rem">
                <template #body="item">S/. {{ parseFloat(item.data.balance).toFixed(2) }}</template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>