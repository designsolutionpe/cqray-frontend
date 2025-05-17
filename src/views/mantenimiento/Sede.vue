<script setup>
import { createSede, deleteSede, getSedes, updateSede } from '@/service/mantenimiento/SedeService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const sedes = ref([]);

const cargarSedes = async () => {
    try {
        sedes.value = await getSedes();
    } catch (error) {
        console.error('Error al obtener las sedes:', error);
    }
};

const toast = useToast();
const selectedFile = ref(null);
const previewSrc = ref(null);
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const sedeDialog = ref(false);
const deleteSedeDialog = ref(false);
const submitted = ref(false);
const sede = ref({});

function onFileSelect(event) {
    const file = event.files[0];

    if (file) {
        selectedFile.value = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewSrc.value = e.target.result;
        };
        reader.readAsDataURL(file);
        toast.add({ severity: 'info', summary: 'Éxito', detail: 'Foto seleccionada correctamente', life: 3000 });
    }
}

function removeImage() {
    sede.value.foto = null;
    selectedFile.value = null;
    previewSrc.value = null;
}

function openNew() {
    sede.value = {};
    submitted.value = false;
    sedeDialog.value = true;
}

function editSede(sed) {
    sede.value = { ...sed };
    if (sed.foto){
        previewSrc.value = `${import.meta.env.VITE_BASE_URL}/storage/${sed.foto}`;
    } else {
        previewSrc.value = null;
    }
    sedeDialog.value = true;
}

function confirmDeleteSede(sed) {
    sede.value = sed;
    deleteSedeDialog.value = true;
}

async function delSede() {
    try {
        await deleteSede(sede.value.id);
        sedes.value = sedes.value.filter((val) => val.id !== sede.value.id);
        deleteSedeDialog.value = false;
        sede.value = {};
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Sede eliminada con éxito', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar la sede:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la sede', life: 3000 });
    }
}

function hideDialog() {
    sedeDialog.value = false;
    submitted.value = false;
}

async function saveSede() {
    submitted.value = true;
    if (sede?.value.nombre?.trim()) { 
        const sanitizeValue = (value) => {
            return value && typeof value === 'string' ? value.trim() : '';
        };

        const formData = new FormData();
        formData.append('nombre', sanitizeValue(sede.value.nombre));
        formData.append('direccion', sanitizeValue(sede.value.direccion));
        formData.append('telefono', sanitizeValue(sede.value.telefono));
        formData.append('email', sanitizeValue(sede.value.email));
        
        if (selectedFile.value instanceof File) {
            formData.append('foto', selectedFile.value);
        } else {
            console.error("⛔ Error: El archivo de imagen no es válido.");
        }

        try {
            if (sede.value.id) {
                await updateSede(sede.value.id, formData);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Sede actualizada', life: 3000 });
            } else {
                await createSede(formData);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Sede creada', life: 3000 });
            }
            await cargarSedes();
            sedeDialog.value = false;
            sede.value = {};
        } catch (error) {
            //console.log("Error:", error);
            console.error('Error al guardar la sede:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la sede', life: 3000 });
        }
    }
}

onMounted(cargarSedes);
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva Sede" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="sedes"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :rowsPerPageOptions="[5, 10, 20]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} sedes"                
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Sedes</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                
                <Column field="id" header="#" sortable style="min-width: 6rem"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 14rem"></Column>
                <Column field="direccion" header="Direccion" sortable style="min-width: 24rem"></Column>
                <Column field="telefono" header="Telefono" sortable style="min-width: 12rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editSede(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteSede(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>


        <Dialog v-model:visible="sedeDialog" :style="{ 'width': '450px' }" header="Sede" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="sede.nombre" required="true" autofocus :invalid="submitted && !sede.nombre" fluid />
                    <small v-if="submitted && !sede.nombre" class="text-red-500">Nombre de sede es requerido.</small>
                </div>
                <div>
                    <label for="direccion" class="block font-bold mb-3">Direccion</label>
                    <Textarea id="direccion" v-model.trim="sede.direccion" required="true" rows="3" cols="20" fluid />
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="telefono" class="block font-bold mb-3">Telefono</label>
                        <InputText id="telefono" v-model="sede.telefono" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" v-model="sede.email" type="email" fluid />
                    </div>
                </div>

                <div>
                    <label for="foto" class="block font-bold mb-3">Foto</label>
                    <div class="flex items-center gap-4">
                        <FileUpload mode="basic" name="foto" accept="image/*" chooseLabel="Seleccionar" 
                        :maxFileSize="1000000" @select="onFileSelect" customUpload auto class="p-button-outlined"/>
                        <div v-if="previewSrc" class="relative flex items-center">
                            <img :src="previewSrc" alt="Foto seleccionada" class="w-32 h-32 rounded-lg shadow" />
                            <Button icon="pi pi-trash" class="ml-2 p-2 rounded-full" severity="danger" @click="removeImage" />
                        </div>
                    </div>
                </div>

            </div>            

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveSede" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSedeDialog" header="Confirmar" :modal="true" :style="{ 'width': '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="sede"
                    >¿Estas seguro que deseas eliminar la sede <b>{{ sede.nombre }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSedeDialog = false" />
                <Button label="Sí" icon="pi pi-check" severity="danger" @click="delSede" />
            </template>
        </Dialog>    
    </div>
</template>