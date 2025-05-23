<script setup>
    import { useStore } from 'vuex'
    import { ref, computed, watch, onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
    import { useToast } from 'primevue'
    import axios from 'axios'
    import { getTipoSeguros } from '@/service/gestion/inventario/TipoSeguroService'

    const store = useStore()
    const id_sede = computed(()=>store.getters.id_sede)

    const oEmpleado = ref({
        nombre: null,
        apellido: null,
        tipo_documento: null,
        numero_documento: null,
        genero: null,
        fecha_nacimiento: null,
        telefono: null,
        direccion: null,
        email: null,
        id_sede: id_sede.value,
        ocupacion: null,
        sueldo: null,
        id_tipo_seguro: null
    })

    const isTipoSeguroLoading = ref(true)
    const isPageLoading = ref(true)

    watch(
        [isTipoSeguroLoading],
        ([tipo_seguro]) => {
            isPageLoading.value = (tipo_seguro)
        }
    )

    const cancelToken = ref()
    const toast = useToast()

    const aTipoDocumentoSelect = ref([
        { value: "DNI" },
        { value: "Carnet de Extranjeria" },
        { value: "Pasaporte" },
        { value: "Otro" }
    ])

    const aGeneroSelect = ref([
        { value: "Masculino" },
        { value: "Femenino" }
    ])
    const aTipoSeguroSelect = ref([])

    const cargarTipoSeguro = async () => {
        isTipoSeguroLoading.value = true
        try
        {
            const response = await getTipoSeguros(cancelToken.value.token)
            if( response )
            {
                console.log(response)
                aTipoSeguroSelect.value = response.map( i => ({
                    label: i.nombre,
                    value: i.id
                }))
            }
            isTipoSeguroLoading.value = false
        }
        catch(error)
        {
            isTipoSeguroLoading.value = false
            handleServerError(error,"tipo seguros",toast)
        }
    }

    onBeforeMount(()=>{
        cancelToken.value = axios.CancelToken.source()
    })

    onMounted(()=>{
        cargarTipoSeguro()
    })

    onBeforeUnmount(()=>{
        cancelToken.value.cancel()
    })

    const showDialog = ref(false)

    const onShowDialog = () => {
        showDialog.value = true
    }

    const onHideDialog = () => {
        showDialog.value = false
    }

    defineExpose({
        onShowDialog
    })
</script>
<template>
    <Dialog v-model:visible="showDialog" :show-header="false" modal :draggable="false" :closable="false" class="pt-4  md:w-[450xp]">
        <p class="text-xl font-bold text-secondary">Agregar nuevo empleado</p>
        <div class="flex flex-col gap-4">
            <label for="nombre_input" class="block font-bold">Nombre</label>
            <InputText v-model:value="oEmpleado.nombre" id="nombre_input"></InputText>
        </div>
        <div class="flex flex-col gap-4">
            <label for="apellido_input" class="block font-bold">Apellido</label>
            <InputText v-model:value="oEmpleado.apellido" id="apellido_input"></InputText>
        </div>
        <div class="flex flex-col gap-4">
            <label for="tipo_documento_select" class="block font-bold">Tipo de documento</label>
            <Select id="tipo_documento_select" :options="aTipoDocumentoSelect" option-label="value" option-value="value" v-model:value="oEmpleado.tipo_documento"></Select>
        </div>
        <div class="flex flex-col gap-4">
            <label for="numero_documento_input" class="block font-bold">Numero de documento</label>
            <InputNumber :use-grouping="false"></InputNumber>
        </div>
        <div class="flex flex-col gap-4"></div>
        <div class="grid grid-cols-4 gap-4 mt-4">
            <Button icon="pi pi-times" label="Cancelar" class="col-span-4 md:col-span-2" outlined @click="onHideDialog"></Button>
        <Button icon="pi pi-check" label="Guardar nuevo" class="col-span-4 md:col-span-2" @click="null"></Button>
        </div>
    </Dialog>
</template>
