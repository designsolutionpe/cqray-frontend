<script setup>
import { ref, onMounted, watch } from 'vue';
import { getNotaCreditos } from '@/service/gestion/NotaCreditoService';
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

const tipoComprobanteText = (tipo) => {
  const tipoComprobanteMap = {
    1: 'Boleta',
    2: 'Factura',
  };
  
  return tipoComprobanteMap[tipo] || 'Desconocido';
};

const notas = ref([]);
const expandedRows = ref([]);

const cargarNotas = async () => {
    try {
        const response = await getNotaCreditos(); // Obtener todas las notas de crédito
        notas.value = response?.data || [];
    } catch (error) {
        console.error('Error al cargar las notas de crédito:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar las notas de crédito', life: 3000 });
    }
};

function openNew() {
    const routeName = 'agregarnota'; // Cambia esto según la ruta de tu componente
    if (routeName) {
        router.push({ name: routeName });
    } else {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ruta no encontrada', life: 3000 });
    }
}

function confirmDeleteNota(nota) {


}

onMounted(() => {
    cargarNotas();
});

</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva Nota" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="notas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} notas"
                v-model:expandedRows="expandedRows"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0"> Notas de Crédito</h4>
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
                <Column field="comprobante" header="Comprobante" sortable style="width: 12%;"></Column>
                <Column field="moneda" header="Moneda" sortable style="width: 12%;"></Column>
                <Column field="subtotal" header="Sub Total" sortable style="width: 10%;"></Column>
                <Column field="monto_igv" header="IGV" sortable style="width: 10%;"></Column>
                <Column field="total" header="Total" sortable style="width: 11%;"></Column>
                <Column style="width: 10%;">
                    <template #body="slotProps">
                        <!--
                        <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-1" @click="viewComprobante(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-1" @click="editComprobante(slotProps.data)" />
                        -->
                        <Button icon="pi pi-trash" outlined rounded severity="danger" class="mr-1" @click="confirmDeleteNota(slotProps.data)" />
                    </template>
                </Column>

            </DataTable>
        </div>
    </div>
    
</template>