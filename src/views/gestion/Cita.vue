<script setup>
import { getCitas } from '@/service/gestion/CitaService';
import { createCita } from '@/service/gestion/CitaService';
import { updateCita } from '@/service/gestion/CitaService';
import { deleteCita } from '@/service/gestion/CitaService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { getPacientes } from '@/service/gestion/PacienteService';
import { getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { getHorariosDisponibles } from '@/service/mantenimiento/HorarioService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const estadosCita = ref([
    { label: 'Pendiente', value: 1 },
    { label: 'Confirmado', value: 2 },
    { label: 'Atendido', value: 3 },
    { label: 'Cancelado', value: 4 },
]);

const tiposPaciente = ref([
    { label: 'Nuevo', value: 1 },
    { label: 'Reporte', value: 2 },
    { label: 'Plan', value: 3 },
    { label: 'Mantenimiento', value: 4 },
]);

const toast = useToast();
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

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
const cargarDoctores = async () => {
    try {
        const response = await getQuiropracticos();
        doctores.value = response.map(doc => ({
            label: `${doc.persona.apellido} ${doc.persona.nombre}`,
            value: doc.id
        }));
    } catch (error) {
        console.error('Error al obtener los quiroprácticos:', error);
    }
};

const pacientes = ref([]);
const cargarPacientes = async () => {
    try {
        const response = await getPacientes();
        pacientes.value = response.map(paciente => ({
            label: `${paciente.persona.apellido} ${paciente.persona.nombre}`,
            value: paciente.id
        }));
    } catch (error) {
        console.error('Error al obtener los pacientes:', error);
    }
};

const horarios = ref([]);
const cargarHorarios = async () => {
    if (cita.value.id_doctor && cita.value.fecha_cita) {

        const fechaSeleccionada = new Date(cita.value.fecha_cita + 'T00:00:00'); 
        let dia = fechaSeleccionada.getDay();

        if (dia === 0){
            dia = 6;
        } else {
            dia -= 1;
        }

        try {
            const response = await getHorariosDisponibles(
                cita.value.fecha_cita, cita.value.id_doctor, dia,
                cita.value.id_detalle_horario);
            horarios.value = response.map((horario) => ({
                label: `${horario.hora_inicio} - ${horario.hora_fin}`,
                value: horario.id
            }));
        } catch (error) {
            console.error('Error al obtener los horarios disponibles:', error);
        }
    } else {
        horarios.value = [];  // Limpiar horarios si no hay doctor o fecha seleccionada
    }
};

const citaDialog = ref(false);
const deleteCitaDialog = ref(false);
const submitted = ref(false);
const citas = ref([]);
const cita = ref({});

const cargarCitas = async () => {
    try {
        citas.value = await getCitas();
    } catch (error) {
        console.error('Error al obtener citas:', error);
    }
}

function openNew(){
    cita.value = {};
    submitted.value = false;
    citaDialog.value = true;
}

function editCita(cit){
    cita.value = { ...cit };
    cargarHorarios();
    citaDialog.value = true;
}

function confirmDeleteCita(cit){
    cita.value = cit;
    deleteCitaDialog.value = true;
}

async function delCita(){
    try {
        await deleteCita(cita.value.id);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada', life: 3000 });
        deleteCitaDialog.value = false;
        cita.value = {};
        await cargarCitas();
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cita', life: 3000 });
    }
}

function hideDialog(){
    citaDialog.value = false;
    submitted.value = false;
}

async function saveCita(){
    submitted.value = true;

    if (!cita.value.id_doctor || !cita.value.id_paciente ||
        !cita.value.fecha_cita || cita.value.estado === null || cita.value.estado === undefined) {
        console.error('⛔ Error: Datos incompletos para guardar la cita.');
        return;
    }

    const payload = {
        // Datos de la Cita
        id_quiropractico: cita.value.id_doctor,
        id_paciente: cita.value.id_paciente,
        id_detalle_horario: cita.value.id_detalle_horario,
        id_sede: cita.value.id_sede,
        fecha_cita: cita.value.fecha_cita,
        estado: cita.value.estado, // 0: Pendiente, 1: Confirmado, 2: Atendido, 9: Cancelado
        tipo_paciente: cita.value.tipo_paciente, // 1: Nuevo, 2: Reporte, 3: Plan, 4: Mantenimiento

        // Datos adicionales para la atención
        fecha_atencion: cita.value.fecha_atencion,
        hora_atencion: cita.value.hora_atencion,
        observaciones: cita.value.observaciones,
    };

    try {
        if (cita.value.id) {
            // Si ya tiene un ID, entonces actualizamos la cita
            await updateCita(cita.value.id, payload);
            toast.add({ severity: 'success', summary: 'Cita Actualizada', life: 3000 });
        } else {
            // Si no tiene ID, creamos una nueva cita
            await createCita(payload);
            toast.add({ severity: 'success', summary: 'Cita Creada', life: 3000 });
        }
        // Recargar las citas y cerrar el formulario
        await cargarCitas();
        citaDialog.value = false;
        cita.value = {};
    } catch (error) {
        console.error('⛔ Error al guardar la cita:', error.response?.data || error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la cita', life: 3000 });
    }
}

const viewCitaDialog = ref(false);
const citaSeleccionada = ref({});

function viewCita(cit) {
    citaSeleccionada.value = { ...cit };
    viewCitaDialog.value = true;
}

onMounted(()=>{
    cargarSedes();
    cargarDoctores();
    cargarPacientes();
    cargarCitas();
});

</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nueva Cita" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable 
                ref="dt"
                :value="citas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :rowsPerPageOptions="[5,10,25,50,100]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas"
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Citas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="id" header="#" sortable style="min-width: 6rem"></Column>
                <Column field="sede.nombre" header="Sede" sortable style="min-width: 6rem"></Column>
                <Column header="Paciente" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ slotProps.data.paciente.persona.apellido + ' ' + slotProps.data.paciente.persona.nombre }}
                    </template>
                </Column>
                <Column header="Quiropráctico" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ slotProps.data.doctor.persona.apellido + ' ' + slotProps.data.doctor.persona.nombre }}
                    </template>
                </Column>
                <Column field="fecha_cita" header="Fecha" sortable style="min-width: 5rem"></Column>
                <Column header="Tipo paciente" sortable style="min-width: 6rem">
                    <template #body="slotProps">
                        {{ tiposPaciente.find(tipo => tipo.value === slotProps.data.tipo_paciente)?.label || 'Desconocido'}}
                    </template>
                </Column>
                <Column header="Estado" sortable style="min-width: 6rem">
                    <template #body="slotProps">
                        {{ estadosCita.find(tipo => tipo.value === slotProps.data.estado)?.label || 'Desconocido'}}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="viewCita(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCita(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCita(slotProps.data)" />
                    </template>
                </Column>


            </DataTable>
        </div>

        <Dialog v-model:visible="citaDialog" :style="{ 'width': '650px' }" header="Cita" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-3">
                    <!-- Paciente -->
                    <div class="col-span-6">
                        <label for="id_paciente" class="block font-bold mb-3">Paciente</label>
                        <Select id="id_paciente" v-model="cita.id_paciente" :options="pacientes"
                        optionLabel="label" filter optionValue="value" placeholder="Seleccione un paciente" fluid />
                    </div>
                    <!-- Doctor -->
                    <div class="col-span-6">
                        <label for="id_doctor" class="block font-bold mb-3">Quiropráctico</label>
                        <Select id="id_doctor" v-model="cita.id_doctor" :options="doctores" @change="cargarHorarios"
                        optionLabel="label" optionValue="value" placeholder="Seleccione un quiropráctico" fluid />
                    </div>
                </div>

                <!-- Fecha de la cita -->
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4">
                        <label for="fecha_cita" class="block font-bold mb-3">Fecha de la Cita</label>
                        <InputText id="fecha_cita" type="date" v-model="cita.fecha_cita" @change="cargarHorarios" fluid />
                    </div>
                    <div class="col-span-4" v-if="cita.id_doctor && cita.fecha_cita">
                        <label for="id_detalle_horario" class="block font-bold mb-3">Turno</label>
                        <Select id="id_detalle_horario" v-model="cita.id_detalle_horario" :options="horarios"
                        optionLabel="label" optionValue="value" placeholder="Seleccione el turno" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="id_sede" class="block font-bold mb-3">Sede</label>
                        <Select id="id_sede" v-model="cita.id_sede" :options="sedes"
                        optionLabel="label" optionValue="value" placeholder="Seleccione una sede" fluid />
                    </div>
                </div>

                <!-- Observaciones -->
                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones</label>
                    <Textarea id="observaciones" v-model="cita.observaciones" rows="3" cols="20" fluid />
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-6">
                        <label for="estado" class="block font-bold mb-3">Estado Cita</label>
                        <Select id="estado" v-model="cita.estado" :options="estadosCita"
                        optionLabel="label" optionValue="value" placeholder="Seleccione el estado" fluid />
                    </div>

                    <div class="col-span-6">
                        <label for="tipo_paciente" class="block font-bold mb-3">Tipo Paciente</label>
                        <Select id="tipo_paciente" v-model="cita.tipo_paciente" :options="tiposPaciente"
                        optionLabel="label" optionValue="value" placeholder="Seleccione el tipo de paciente" fluid />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveCita" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCitaDialog" header="Confirmar" :modal="true" :style="{ 'width': '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="cita.id">
                    ¿Estás seguro de que deseas eliminar la cita para el paciente:
                    <b>{{ cita.paciente.persona.nombre + ' ' + cita.paciente.persona.apellido }}</b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteCitaDialog = false" />
                <Button label="Sí" icon="pi pi-check" class="p-button-text" @click="delCita" />
            </template>
        </Dialog>
    </div>
</template>