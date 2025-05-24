<script setup>
import { createEmpleado } from '@/service/gestion/inventario/EmpleadoService'
import { getTipoSeguros } from '@/service/gestion/inventario/TipoSeguroService'
import { getSedes } from '@/service/mantenimiento/SedeService'
import { handleServerError } from '@/utils/Util'
import axios from 'axios'
import { useToast } from 'primevue'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
    onAfterEventCallback: {
        type: Function
    }
})

const store = useStore()
const id_sede = computed(() => store.getters.id_sede)

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
    id_tipo_seguro: null,
    is_planilla: false
})

const isSedeLoading = ref(true)
const isTipoSeguroLoading = ref(true)
const isPageLoading = ref(true)

watch(
    [
        isTipoSeguroLoading,
        isSedeLoading
    ],
    ([tipo_seguro, sede]) => {
        isPageLoading.value = (tipo_seguro || sede)
    }
)

const cancelToken = ref()
const toast = useToast()

const aTipoDocumentoSelect = ref([
    { value: "DNI" },
    { value: "Carnet de Extranjería" },
    { value: "Pasaporte" },
    { value: "Otro" }
])

const aGeneroSelect = ref([
    { value: "Masculino" },
    { value: "Femenino" }
])
const aTipoSeguroSelect = ref([])
const aSedesSelect = ref([])

const cargarTipoSeguro = async () => {
    isTipoSeguroLoading.value = true
    try {
        const response = await getTipoSeguros(cancelToken.value.token)
        if (response) {
            console.log(response)
            aTipoSeguroSelect.value = response.map(i => ({
                label: i.nombre,
                value: i.id
            }))
        }
        isTipoSeguroLoading.value = false
    }
    catch (error) {
        isTipoSeguroLoading.value = false
        handleServerError(error, "tipo seguros", toast)
    }
}

const cargarSedes = async () => {
    isSedeLoading.value = true
    try {
        const response = await getSedes(cancelToken.value.token)
        if (response) {
            aSedesSelect.value = response.map(s => ({
                label: s.nombre,
                value: s.id
            }))
            oEmpleado.value = {
                ...oEmpleado.value,
                id_sede: parseInt(id_sede.value)
            }
        }
        isSedeLoading.value = false
    }
    catch (error) {
        isSedeLoading.value = false
        handleServerError(error, 'sedes', toast)
    }
}

const onCreateEmpleado = async () => {
    onHideDialog()
    isPageLoading.value = true
    try {
        const response = await createEmpleado(oEmpleado.value)
        cargarPreData()
        props.onAfterEventCallback()
    }
    catch (error) {
        isPageLoading.value = false
        handleServerError(error, 'Crear empleado', toast)
    }
}

const cargarPreData = () => {
    cargarTipoSeguro()
    cargarSedes()
}

onBeforeMount(() => {
    cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarPreData()
})

onBeforeUnmount(() => {
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
    <Dialog v-model:visible="showDialog" :show-header="false" modal :draggable="false" :closable="false"
        class="pt-4 w-3/4 md:w-[650px]">
        <p class=" text-xl font-bold text-secondary">Agregar nuevo empleado</p>
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-4 gap-4">
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="nombre_input" class="block font-bold">Nombre</label>
                    <InputText v-model:model-value="oEmpleado.nombre" id="nombre_input"></InputText>
                </div>
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="apellido_input" class="block font-bold">Apellido</label>
                    <InputText v-model:model-value="oEmpleado.apellido" id="apellido_input"></InputText>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div class="col-span-3 md:col-span-1 flex flex-col gap-4">
                    <label for="tipo_documento_select" class="block font-bold">Tipo de documento</label>
                    <Select id="tipo_documento_select" :options="aTipoDocumentoSelect" option-label="value"
                        option-value="value" v-model:model-value="oEmpleado.tipo_documento"></Select>
                </div>
                <div class="col-span-3 md:col-span-1 flex flex-col gap-4">
                    <label for="numero_documento_input" class="block font-bold">Numero de documento</label>
                    <InputText id="numero_documento_input" v-model:model-value="oEmpleado.numero_documento"></InputText>
                </div>
                <div class="col-span-3 md:col-span-1 flex flex-col gap-4">
                    <label for="genero_select" class="block font-bold">Genero</label>
                    <Select id="genero_select" :options="aGeneroSelect" option-label="value" option-value="value"
                        v-model:model-value="oEmpleado.genero"></Select>
                </div>
            </div>
            <div class="grid grid-cols-4 gap-4">
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="fecha_nacimiento_input" class="block font-bold">Fecha de nacimiento</label>
                    <DatePicker :model-value="oEmpleado.fecha_nacimiento" id="fecha_nacimiento_input" dateFormat="dd/mm/yy"></DatePicker>
                </div>
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="numero_telefono_input" class="block font-bold">Numero de telefono</label>
                    <InputNumber :use-grouping="false" id="numero_telefono_input" v-model:model-value="oEmpleado.telefono">
                    </InputNumber>
                </div>
            </div>
            <div class="grid grid-cols-4 gap-4">
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="direccion_input" class="block font-bold">Direccion</label>
                    <InputText v-model:model-value="oEmpleado.direccion" id="direccion_input"></InputText>
                </div>
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="email_input" class="block font-bold">Email</label>
                    <InputText v-model:model-value="oEmpleado.email" id="email_input"></InputText>
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <label for="sede_select" class="block font-bold">Sede</label>
                <Select :disabled="id_sede != null" id="sede_select" :options="aSedesSelect" option-label="label"
                    option-value="value" v-model:model-value="oEmpleado.id_sede"></Select>
            </div>
            <div class="grid grid-cols-4 gap-4">
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="ocupacion_input" class="block font-bold">Ocupación</label>
                    <InputText v-model:model-value="oEmpleado.ocupacion" id="ocupacion_input"></InputText>
                </div>
                <div class="col-span-4 md:col-span-2 flex flex-col gap-4">
                    <label for="sueldo_input" class="block font-bold">Sueldo bruto</label>
                    <InputNumber id="sueldo_input" mode="currency" currency="PEN" locale="es-PE" :use-grouping="false"
                        v-model:model-value="oEmpleado.sueldo">
                    </InputNumber>
                </div>
            </div>
            <div class="grid grid-cols-4 gap-4">
            <div class="col-span-3 flex flex-col gap-4">
                <label for="tipo_seguro_input" class="block font-bold">Tipo de seguro</label>
                <Select id="tipo_seguro_input" :options="aTipoSeguroSelect" option-label="label" option-value="value"
                    v-model:model-value="oEmpleado.id_tipo_seguro"></Select>
            </div>
            <div class="col-span-1 flex flex-col gap-4">
                <label for="planilla_check" class="block font-bold">Planilla</label>
                <Checkbox v-model="oEmpleado.is_planilla" inputId="planilla_check" binary></Checkbox>
            </div>
            </div>
            <div class="grid grid-cols-4 gap-4 mt-4">
                <Button icon="pi pi-times" label="Cancelar" class="col-span-4 md:col-span-2" outlined
                    @click="onHideDialog"></Button>
                <Button icon="pi pi-check" label="Guardar nuevo" class="col-span-4 md:col-span-2"
                    @click="onCreateEmpleado"></Button>
            </div>
        </div>
    </Dialog>
</template>
