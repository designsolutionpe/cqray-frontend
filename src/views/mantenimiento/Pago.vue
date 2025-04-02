<script setup>
import { getPagos } from '@/service/mantenimiento/PagoService';
import { createPago } from '@/service/mantenimiento/PagoService';
import { updatePago } from '@/service/mantenimiento/PagoService';
import { deletePago } from '@/service/mantenimiento/PagoService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const metodosPago = ref ([
    { label: "Transferencia", value: "Transferencia" },
    { label: "Efectivo", value: "Efectivo" },
    { label: "Plin", value: "Plin" },
    { label: "Yape", value: "Yape" }
]);

const monedas = ref ([
    { label: "Soles", value: "PEN" },
    { label: "Dolares", value: "USD" }
]);

const estados = ref([
    { label: "Activo", value: 1 },
    { label: "Inactivo", value: 0 }
]);

const sedes = ref([]);

const cargarSedes = async () => {
    try {
        const response = await getSedes();
        sedes.value = response.map(sede => ({
            label: sede.nombre,
            value: sede.id
        }));
    } catch (error) {
        console.error('Error al obtener las sedes:', error);
    }
};

const pagos = ref([]);
const toast = useToast();
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const pagoDialog = ref(false);
const deletePagoDialog = ref(false);
const submitted = ref(false);
const pago = ref();

const cargarPagos = async () => {
    try {
        pagos.value = await getPagos();
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
    }
};

function openNew() {
    pago.value = {};
    submitted.value = false;
    pagoDialog.value = true;
}

function editPago(pag) {
    pago.value = { ...pag };
    submitted.value = false;
    pagoDialog.value = true;
}

function confirmDeletePago(pag) {
    pago.value = { ...pag };
    deletePagoDialog.value = true;
}

async function delPago() {
    try {
        await deletePago(pago.value.id);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Pago eliminado correctamente', life: 3000 });
        deletePagoDialog.value = false;
        cargarPagos();
    } catch (error) {
        console.error('Error al eliminar el pago:', error);
    }
}

function hideDialog() {
    pagoDialog.value = false;
    submitted.value = false;
}

async function savePago() {
    submitted.value = true;

    if (pago.value.id_sede && pago.value.metodo_pago && 
        pago.value.moneda && pago.value.estado>=0) {
        try {
            if (pago.value.id) {
                await updatePago(pago.value.id,pago.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Método de Pago actualizado', life: 3000 });
            } else {
                await createPago(pago.value);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Método de Pago creado', life: 3000 });
            }
            await cargarPagos();
            pagoDialog.value = false;
            pago.value = {};
        } catch (error) {
            console.error('Error al guardar el pago:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar método de pago', life: 3000 });
        }
    }
}

onMounted(() => {
    cargarSedes();
    cargarPagos();
});

</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Método" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable 
                ref="dt"
                :value="pagos"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :rowsPerPageOptions="[5,10,25]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} pagos"
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Configuración de Pagos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="id" header="#" sortable style="width: 5%" />
                <Column field="sede.nombre" header="Sede" sortable style="width: 15%" />
                <Column field="metodo_pago" header="Método Pago" sortable style="width: 15%" />
                <Column field="detalle_concepto" header="Detalle" sortable style="width: 20%" />
                <Column field="numero_cuenta" header="Número Cuenta" sortable style="width: 20%" />
                <Column header="Estado" sortable style="width: 10%">
                    <template #body="slotProps">
                        <Tag :severity="slotProps.data.estado ? 'success' : 'danger'">
                            {{ slotProps.data.estado ? 'Activo' : 'Inactivo' }}
                        </Tag>
                    </template>
                </Column>
                    
                <Column :exportable="false" style="width: 25%">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPago(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePago(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="pagoDialog" :style="{ 'width': '650px' }" header="Método de pago" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4">
                        <label for="sede" class="block font-bold mb-3">Sede</label>
                        <Select id="sede" v-model="pago.id_sede" :options="sedes" optionLabel="label" optionValue="value" placeholder="Seleccione sede" fluid />
                    </div>
                    <div class="col-span-5">
                        <label for="metodo" class="block font-bold mb-3">Método Pago</label>
                        <Select id="metodo" v-model="pago.metodo_pago" :options="metodosPago" optionLabel="label" optionValue="value" placeholder="Seleccione método pago" fluid />
                    </div>
                    <div class="col-span-3">
                        <label for="moneda" class="block font-bold mb-3">Moneda</label>
                        <Select id="moneda" v-model="pago.moneda" :options="monedas" optionLabel="label" optionValue="value" placeholder="Seleccione moneda" fluid />
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-12">
                        <label for="detalle" class="block font-bold mb-3">Detalle Concepto</label>
                        <InputText id="detalle" v-model="pago.detalle_concepto" placeholder="Detalle del concepto" fluid />
                    </div>
                    <div class="col-span-9">
                        <label for="numero" class="block font-bold mb-3">Número Cuenta</label>
                        <InputText id="numero" v-model="pago.numero_cuenta" placeholder="Número cuenta" fluid />
                    </div>
                    <div class="col-span-3">
                        <label for="estado" class="block font-bold mb-3">Estado</label>
                        <Select id="estado" v-model="pago.estado" :options="estados" optionLabel="label" optionValue="value" placeholder="Seleccione estado" fluid />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="savePago" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePagoDialog" header="Confirmar" :modal="true" :style="{ 'width': '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="pago"
                    >¿Estas seguro que deseas eliminar el metodo de pago para la sede <b>{{ pago.sede.nombre }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletePagoDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="delPago" />
            </template>
        </Dialog>
    </div>

</template>