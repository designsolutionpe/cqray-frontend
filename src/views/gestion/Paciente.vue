<script setup>
import { getPacientes } from '@/service/gestion/PacienteService';
import { createPaciente } from '@/service/gestion/PacienteService';
import { updatePaciente } from '@/service/gestion/PacienteService';
import { deletePaciente } from '@/service/gestion/PacienteService';
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

const gruposSanguineos = ref([
    { label: "O-", value: "O-" },
    { label: "O+", value: "O+" },
    { label: "A-", value: "A-" },
    { label: "A+", value: "A+" },
    { label: "B-", value: "B-" },    
    { label: "B+", value: "B+" },
    { label: "AB-", value: "AB-" },
    { label: "AB+", value: "AB+" },
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

const pacientes = ref([]);
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
    paciente.value.persona.foto = null;
    selectedFile.value = null;
    previewSrc.value = null;
}

const pacienteDialog = ref(false);
const deletePacienteDialog = ref(false);
const submitted = ref(false);
const paciente = ref({
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
    grupo_sanguineo: "",
    estado: 1,
});

const cargarPacientes = async () => {
    try {
        pacientes.value = await getPacientes();
    } catch (error) {
        console.error('Error al obtener los pacientes:', error);
    }
};

function openNew() {
    paciente.value = {
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
        grupo_sanguineo: "",
        estado: 1,
    };
    submitted.value = false;
    pacienteDialog.value = true;
}

function editPaciente(pac) {
    paciente.value = { ...pac };

    if (pac.persona.foto) {
        previewSrc.value = `${import.meta.env.VITE_BASE_URL}/storage/${pac.persona.foto}`;
    } else {
        previewSrc.value = null;
    }

    pacienteDialog.value = true;
}

function confirmDeletePaciente(pac) {
    paciente.value = pac;
    deletePacienteDialog.value = true;
}

async function delPaciente() {
    try {
        await deletePaciente(paciente.value.id);
        pacientes.value = pacientes.value.filter(p => p.id !== paciente.value.id);
        deletePacienteDialog.value = false;
        paciente.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Paciente eliminado', life: 3000 });
    } catch (error) {
        console.error('Error al eliminar el paciente:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el paciente', life: 3000 });
    }
}

function hideDialog() {
    pacienteDialog.value = false;
    submitted.value = false;
}

async function savePaciente() {
    submitted.value = true;

    if (!paciente.value.persona || !paciente.value.persona.nombre || 
        !paciente.value.persona.apellido || !paciente.value.persona.numero_documento) {
        console.error('⛔ Error: Datos incompletos para guardar paciente.');
        return;
    }

    const sanitizeValue = (value) => {
        return value && typeof value === 'string' ? value.trim() : '';
    };

    const sanitizeNumber = (value) => {
        return value && !isNaN(value) ? value : '';
    };


    const formData = new FormData();
    // Datos de Persona
    formData.append("tipo_documento", sanitizeValue(paciente.value.persona.tipo_documento));
    formData.append("numero_documento", sanitizeValue(paciente.value.persona.numero_documento));
    formData.append("nombre", sanitizeValue(paciente.value.persona.nombre));
    formData.append("apellido", sanitizeValue(paciente.value.persona.apellido));
    formData.append("genero", sanitizeValue(paciente.value.persona.genero));
    formData.append("fecha_nacimiento", sanitizeValue(paciente.value.persona.fecha_nacimiento));
    formData.append("direccion", sanitizeValue(paciente.value.persona.direccion));
    formData.append("telefono", sanitizeValue(paciente.value.persona.telefono));
    formData.append("email", sanitizeValue(paciente.value.persona.email));

    
    // Datos de Paciente
    formData.append("id_sede", sanitizeNumber(paciente.value.id_sede));
    formData.append("grupo_sanguineo", sanitizeValue(paciente.value.grupo_sanguineo));
    formData.append("estado", sanitizeNumber(paciente.value.estado));

    // Adjuntar imagen si existe
    if (selectedFile.value instanceof File) {
        formData.append("foto", selectedFile.value);
    } else {
        console.error("⛔ Error: El archivo de imagen no es válido.");
    }

    try {
        if (paciente.value.id) {
            await updatePaciente(paciente.value.id, formData);
            toast.add({ severity: 'success', summary: 'Paciente Actualizado', life: 3000 });
        } else {
            await createPaciente(formData);
            toast.add({ severity: 'success', summary: 'Paciente Creado', life: 3000 });
        }
        await cargarPacientes();
        pacienteDialog.value = false;
        paciente.value = {};
    } catch (error) {
        console.error('⛔ Error al guardar el paciente:', error.response?.data || error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el paciente', life: 3000 });
    }
}


onMounted(() => {
    cargarSedes();
    cargarPacientes();
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Paciente" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable 
                ref="dt"
                :value="pacientes"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :rowsPerPageOptions="[5,10,25,50,100]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} pacientes"    
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Pacientes</h4>
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
                <Column field="grupo_sanguineo" header="Grupo Sanguineo" sortable style="min-width: 6rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPaciente(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePaciente(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="pacienteDialog" :style="{ 'width': '650px' }" header="Paciente" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-5">
                        <label for="tipoDocumento" class="block font-bold mb-3">Tipo Documento</label>
                        <Select id="tipoDocumento" v-model="paciente.persona.tipo_documento" :options="tiposDocumento"
                        optionLabel="label" optionValue="value" placeholder="Seleccione un tipo" fluid />
                    </div>
                    <div class="col-span-7">
                        <label for="numeroDocumento" class="block font-bold mb-3">Número Documento</label>
                        <InputText id="numeroDocumento" v-model="paciente.persona.numero_documento" required="true" fluid />
                        <small v-if="submitted && !paciente.persona.numero_documento" class="text-red-500">Número de documento es requerido.</small>
                    </div>
                </div>

                <!-- Apellidos y Nombres -->
                <div>
                    <label for="apellido" class="block font-bold mb-3">Apellidos</label>
                    <InputText id="apellido" v-model.trim="paciente.persona.apellido" required="true" fluid />
                    <small v-if="submitted && !paciente.persona.apellido" class="text-red-500">Apellidos son requeridos.</small>
                </div>
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombres</label>
                    <InputText id="nombre" v-model.trim="paciente.persona.nombre" required="true" fluid />
                    <small v-if="submitted && !paciente.persona.nombre" class="text-red-500">Nombres son requeridos.</small>
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4">
                        <label for="genero" class="block font-bold mb-3">Género</label>
                        <Select id="genero" v-model="paciente.persona.genero" :options="generos"
                        optionLabel="label" optionValue="value" placeholder="Seleccione género" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="fechaNacimiento" class="block font-bold mb-3">Fecha de Nacimiento</label>
                        <InputText id="fechaNacimiento" type="date" v-model="paciente.persona.fecha_nacimiento" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="telefono" class="block font-bold mb-3">Teléfono</label>
                        <InputText id="telefono" v-model="paciente.persona.telefono" fluid />
                    </div>
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-3">Dirección</label>
                    <InputText id="direccion" v-model.trim="paciente.persona.direccion" fluid />
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-6">
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" type="email" v-model="paciente.persona.email" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="grupoSanguineo" class="block font-bold mb-3">Grupo Sanguíneo</label>
                        <Select id="grupoSanguineo" v-model="paciente.grupo_sanguineo" :options="gruposSanguineos" optionLabel="label" optionValue="value" placeholder="Seleccione un grupo sanguíneo" fluid />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-6">
                        <label for="sede" class="block font-bold mb-3">Sede</label>
                        <Select id="sede" v-model="paciente.id_sede" :options="sedes"
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
                <Button label="Guardar" icon="pi pi-check" @click="savePaciente" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePacienteDialog" header="Confirmar" :modal="true" :style="{ 'width': '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="paciente.persona.nombre">
                    ¿Estas seguro que deseas eliminar al paciente : 
                    <b>{{ (paciente.persona.nombre || '') + ' ' + (paciente.persona.apellido || '') }}
                    </b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="deletePacienteDialog = false" />
                <Button label="Sí" icon="pi pi-check" class="p-button-text" @click="delPaciente" />
            </template>
        </Dialog>
    </div>
</template>