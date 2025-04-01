<script setup>
import { getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { createQuiropractico } from '@/service/gestion/QuiropracticoService';
import { updateQuiropractico } from '@/service/gestion/QuiropracticoService';
import { deleteQuiropractico } from '@/service/gestion/QuiropracticoService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const tiposDocumento = ref([
    { label: "DNI", value: "DNI" },
    { label: "Carnet de Extranjeria", value: "Carnet de Extranjeria" },
    { label: "Pasaporte", value: "Pasaporte" },
    { label: "Otro", value: "Otro" }
]);

const generos = ref([
    { label: "Masculino", value: "Masculino" },
    { label: "Femenino", value: "Femenino" },
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

const doctores = ref([]);
const toast = useToast();
const selectedFile = ref(null);
const previewSrc = ref(null);
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

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
    doctor.value.persona.foto = null;
    selectedFile.value = null;
    previewSrc.value = null;
}

const doctorDialog = ref(false);
const deleteDoctorDialog = ref(false);
const submitted = ref(false);
const doctor = ref({
    persona: {
        tipo_documento: "DNI",
        numero_documento: "",
        nombre: "",
        apellido: "",
        genero: "",
        fecha_nacimiento: "",
        direccion: "",
        telefono: "",
        email: "",
        foto: null
    },
    id_sede: null,
    numero_colegiatura: "",
    especialidad: "",
    datos_contacto: "",
    estado: 1,
});

const cargarDoctores = async () => {
    try {
        doctores.value = await getQuiropracticos();
    } catch (error) {
        console.error('Error al obtener los quiroprácticos:', error);
    }
};

function openNew() {
    doctor.value = {
        persona: {
            tipo_documento: "DNI",
            numero_documento: "",
            nombre: "",
            apellido: "",
            genero: "",
            fecha_nacimiento: "",
            direccion: "",
            telefono: "",
            email: "",
            foto: null
        },
        id_sede: null,
        numero_colegiatura: "",
        especialidad: "",
        datos_contacto: "",
        estado: 1,
    };
    submitted.value = false;
    doctorDialog.value = true;
}

function editDoctor(doc) {
    doctor.value = { ...doc };
    if (doc.persona.foto) {
        previewSrc.value = `${import.meta.env.VITE_BASE_URL}/storage/${doc.persona.foto}`;
    } else {
        previewSrc.value = null;
    }
    doctorDialog.value = true;
}

function confirmDeleteDoctor(doc) {
    doctor.value = doc;
    deleteDoctorDialog.value = true;
}

async function delDoctor() {
    try {
        await deleteQuiropractico(doctor.value.id);
        doctores.value = doctores.value.filter((val) => val.id !== doctor.value.id);
        deleteDoctorDialog.value = false;
        doctor.value = {};
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Quiropráctico eliminado con éxito', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar el quiropráctico:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el quiropráctico', life: 3000 });
    }
}

function hideDialog() {
    doctorDialog.value = false;
    submitted.value = false;
}

async function saveDoctor(){
    submitted.value = true;

    if (!doctor.value.persona || !doctor.value.persona.nombre || 
        !doctor.value.persona.apellido || !doctor.value.persona.numero_documento) {
        console.error('⛔ Error: Datos incompletos para guardar doctor.');
        return;
    }

    const sanitizeValue = (value) => {
        return value && typeof value === 'string' ? value.trim() : '';
    };

    const sanitizeNumber = (value) => {
        return value && !isNaN(value) ? value : '';
    };

    const formData = new FormData();
    //Datos de Persona
    formData.append('tipo_documento', sanitizeValue(doctor.value.persona.tipo_documento));
    formData.append('numero_documento', sanitizeValue(doctor.value.persona.numero_documento));
    formData.append('nombre', sanitizeValue(doctor.value.persona.nombre));
    formData.append('apellido', sanitizeValue(doctor.value.persona.apellido));
    formData.append('genero', sanitizeValue(doctor.value.persona.genero));
    formData.append('fecha_nacimiento', sanitizeValue(doctor.value.persona.fecha_nacimiento));
    formData.append('direccion', sanitizeValue(doctor.value.persona.direccion));
    formData.append('telefono', sanitizeValue(doctor.value.persona.telefono));
    formData.append('email', sanitizeValue(doctor.value.persona.email));

    //Datos de Doctor
    formData.append('id_sede', sanitizeNumber(doctor.value.id_sede));
    formData.append('numero_colegiatura', sanitizeValue(doctor.value.numero_colegiatura));
    formData.append('especialidad', sanitizeValue(doctor.value.especialidad));
    formData.append('datos_contacto', sanitizeValue(doctor.value.datos_contacto));
    formData.append('estado', sanitizeNumber(doctor.value.estado));

    if (selectedFile.value instanceof File) {
        formData.append('foto', selectedFile.value);
    } else {
        console.error("⛔ Error: El archivo de imagen no es válido.");
    }

    try {
        if (doctor.value.id) {
            await updateQuiropractico(doctor.value.id, formData);
            toast.add({ severity: 'success', summary: 'Quiropráctico actualizado', life: 3000 });
        } else {
            await createQuiropractico(formData);
            toast.add({ severity: 'success', summary: 'Quiropráctico creado', life: 3000 });
        }
        await cargarDoctores();
        doctorDialog.value = false;
        doctor.value = {};
    } catch (error) {
        console.error('⛔ Error al guardar el quiropráctivo:', error.response?.data || error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el quiropráctico', life: 3000 });
    }
}

onMounted(() => {
    cargarSedes();
    cargarDoctores();
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Quiropráctico" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="doctores"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filers="filters"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} quiroprácticos"    
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Quiroprácticos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="id" header="#" sortable style="min-width: 6rem"></Column>
                <Column field="persona.tipo_documento" header="Tipo Documento" sortable style="min-width: 6rem"></Column>
                <Column field="persona.apellido" header="Apellidos" sortable style="min-width: 10rem"></Column>
                <Column field="persona.nombre" header="Nombres" sortable style="min-width: 10rem"></Column>
                <Column field="persona.genero" header="Genero" sortable style="min-width: 5rem"></Column>
                <Column field="persona.fecha_nacimiento" header="Fecha Nacimiento" sortable style="min-width: 6rem"></Column>
                <Column field="especialidad" header="Especialidad" sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editDoctor(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteDoctor(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="doctorDialog" :style="{ 'width': '650px' }" header="Quiropráctico" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4">
                        <label for="tipo_documento" class="block font-bold mb-3">Tipo Documento</label>
                        <Select id="tipo_documento" v-model="doctor.persona.tipo_documento" :options="tiposDocumento"
                        optionLabel="label" optionValue="value" placeholder="Seleccione un tipo" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="numero_documento" class="block font-bold mb-3">Número Documento</label>
                        <InputText id="numero_documento" v-model.trim="doctor.persona.numero_documento" required="true" fluid />
                        <small v-if="submitted && !doctor.persona.numero_documento" class="text-red-500">Número de documento es requerido.</small>
                    </div>
                    <div class="col-span-4">
                        <label for="numero_colegiatura" class="block font-bold mb-3">Número Colegiatura</label>
                        <InputText id="numero_colegiatura" v-model.trim="doctor.numero_colegiatura" fluid />
                    </div>
                </div>

                <!-- Apellidos y Nombres -->
                <div>
                    <label for="apellido" class="block font-bold mb-3">Apellidos</label>
                    <InputText id="apellido" v-model.trim="doctor.persona.apellido" required="true" fluid />
                    <small v-if="submitted && !doctor.persona.apellido" class="text-red-500">Apellidos son requeridos.</small>
                </div>
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombres</label>
                    <InputText id="nombre" v-model.trim="doctor.persona.nombre" required="true" fluid />
                    <small v-if="submitted && !doctor.persona.nombre" class="text-red-500">Nombres son requeridos.</small>
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4">
                        <label for="genero" class="block font-bold mb-3">Genero</label>
                        <Select id="genero" v-model="doctor.persona.genero" :options="generos"
                        optionLabel="label" optionValue="value" placeholder="Seleccione género" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="fecha_nacimiento" class="block font-bold mb-3">Fecha Nacimiento</label>
                        <InputText id="fecha_nacimiento" type="date" v-model="doctor.persona.fecha_nacimiento" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="telefono" class="block font-bold mb-3">Teléfono</label>
                        <InputText id="telefono" v-model="doctor.persona.telefono" fluid />
                    </div>
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-3">Dirección</label>
                    <InputText id="direccion" v-model.trim="doctor.persona.direccion" fluid />
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-6">
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" v-model="doctor.persona.email" type="email" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="especialidad" class="block font-bold mb-3">Especialidad</label>
                        <InputText id="especialidad" v-model="doctor.especialidad" fluid />
                    </div>
                </div>

                <div>
                    <label for="datos_contacto" class="block font-bold mb-3">Datos de Contacto</label>
                    <Textarea id="datos_contacto" v-model.trim="doctor.datos_contacto" rows="3" cols="20" fluid />
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-6">
                        <label for="id_sede" class="block font-bold mb-3">Sede</label>
                        <Select id="id_sede" v-model="doctor.id_sede" :options="sedes"
                        optionLabel="label" optionValue="value" placeholder="Seleccione una sede" fluid />
                    </div>
                    <div class="col-span-6">
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
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveDoctor" />
            </template>   
        </Dialog>

        <Dialog v-model:visible="deleteDoctorDialog" header="Confirmar" :modal="true" :style="{ 'width': '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="doctor.persona.nombre">
                    ¿Estas seguro que deseas eliminar el quiropráctico: 
                    <b>{{ (doctor.persona.nombre || '') + ' '+ (doctor.persona.apellido || '') }}                        
                    </b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDoctorDialog = false" />
                <Button label="Sí" icon="pi pi-check" class="p-button-text" @click="delDoctor" />
            </template>
        </Dialog>    
    </div>
</template>
