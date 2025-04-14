<script setup>
import { ref, onMounted, watch } from 'vue';
import { getComprobantes } from '@/service/gestion/ComprobanteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

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
const filteredComprobantes = ref([]);

// Función para cargar los comprobantes
const cargarComprobantes = async () => {
    try {
        const response = await getComprobantes(); // Obtener todos los comprobantes
        comprobantes.value = response;
        // Filtrar comprobantes según el tipo recibido como prop
        filteredComprobantes.value = comprobantes.value.filter(comprobante => comprobante.tipo_comprobante === tipoComprobanteProp.tipoComprobante);
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

                <Column field="id" header="#" sortable style="min-width: 6rem"></Column>
                <Column field="numero" header="Número" sortable style="min-width: 8rem" />
                <Column field="fecha_emision" header="Fecha Emisión" sortable style="min-width: 10rem" />
                <Column field="total" header="Total" sortable style="min-width: 8rem" />
                <Column field="igv" header="IGV" sortable style="min-width: 8rem" />
                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded severity="info" @click="viewComprobante(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editComprobante(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteComprobante(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>