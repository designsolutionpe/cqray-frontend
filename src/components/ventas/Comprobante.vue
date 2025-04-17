<script setup>
import { ref, onMounted, watch } from 'vue';
import { getComprobantes } from '@/service/gestion/ComprobanteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { formatDate } from '@/utils/Util';

const router = useRouter();
const toast = useToast();
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const routeMap = {
  1: 'agregarboleta',
  2: 'agregarfactura',
  3: 'agregarnota'
};

const tipoComprobanteProp = defineProps({
  tipoComprobante: {
    type: Number,
    required: true
  }
});

const tipoComprobanteText = (tipo) => {
  const tipoComprobanteMap = {
    1: 'Boleta',
    2: 'Factura',
    3: 'Nota de Crédito'
  };
  
  return tipoComprobanteMap[tipo] || 'Desconocido';
};

const comprobantes = ref([]);
const expandedRows = ref([]);
const filteredComprobantes = ref([]);

// Función para cargar los comprobantes
const cargarComprobantes = async () => {
    try {
        const response = await getComprobantes(); // Obtener todos los comprobantes
        comprobantes.value = response?.data || [];
        // Filtrar comprobantes según el tipo recibido como prop
        filteredComprobantes.value = comprobantes.value.filter(
            comprobante => comprobante.tipo_comprobante === tipoComprobanteProp.tipoComprobante);

    } catch (error) {
        console.error('Error al cargar los comprobantes:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los comprobantes', life: 3000 });
    }
};

function openNew() {
    const routeName = routeMap[tipoComprobanteProp.tipoComprobante];
    if (routeName) {
        router.push({ name: routeName });
    } else {
        console.warn('Tipo de comprobante no válido');
    }
}

function viewComprobante(){

}

function editComprobante(){

}

function confirmDeleteComprobante(){

}

onMounted(() => {
    cargarComprobantes();
});

// Si el tipo de comprobante cambia, actualizar el listado
watch(() => tipoComprobanteProp.tipoComprobante, () => {
    cargarComprobantes();
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="filteredComprobantes"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} comprobantes"
                v-model:expandedRows="expandedRows"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0"> {{ tipoComprobanteText(tipoComprobanteProp.tipoComprobante) }}</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column expander style="width: 5%"></Column>
                <Column field="serie" header="Serie" sortable style="width: 7%;"></Column>
                <Column field="numero" header="Número" sortable style="width: 8%;"></Column>
                <Column field="fecha_emision" header="Fecha Emisión" sortable style="width: 12%;">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.fecha_emision) }}
                    </template>
                </Column>
                <Column field="moneda" header="Moneda" sortable style="width: 12%;"></Column>
                <Column field="subtotal" header="Sub Total" sortable style="width: 10%;"></Column>
                <Column field="monto_igv" header="IGV" sortable style="width: 10%;"></Column>
                <Column field="descuento" header="Descuento" sortable style="width: 10%;"></Column>
                <Column field="total" header="Total" sortable style="width: 11%;"></Column>
                <Column style="width: 10%;">
                    <template #body="slotProps">
                        <!--
                        <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-1" @click="viewComprobante(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-1" @click="editComprobante(slotProps.data)" />
                        -->
                        <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-1" @click="confirmDeleteComprobante(slotProps.data)" />
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div class="p-4">
                        <h6>Comprobante {{ slotProps.data.serie }} - {{ slotProps.data.numero }}</h6>
                        <!-- Mostrar los detalles de los productos asociados al comprobante -->
                        <DataTable :value="slotProps.data.detalles">
                            <Column field="nombre_articulo" header="Artículo" />
                            <Column field="cantidad" header="Cantidad" />
                            <Column field="descuento" header="Descuento" />
                            <Column field="precio_unitario" header="Precio Unitario" />
                            <Column field="total_producto" header="Total Producto" />
                        </DataTable>
                    </div>
                </template>

            </DataTable>
        </div>
    </div>
</template>