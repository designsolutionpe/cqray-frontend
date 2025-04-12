<script setup>
import { getQuiropracticos } from '@/service/gestion/QuiropracticoService';
import { getHorariosMedico } from '@/service/mantenimiento/HorarioService';
import { upsertHorarios } from '@/service/mantenimiento/HorarioService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

const id_doctor = ref(null);
const doctores = ref([]);
const toast = useToast();
const dt = ref();

const cargarDoctores = async () => {
    try {
        const response = await getQuiropracticos();
        doctores.value = response.map(doc => ({
            value: doc.id,
            label: `${doc.persona.tipo_documento}: ${doc.persona.numero_documento} - ${doc.persona.apellido} ${doc.persona.nombre} - ${doc.especialidad}`
        }));
    } catch (error) {
        console.error('Error al obtener los quiroprácticos:', error);
    }
};

const horarios = ref([
    { dia: 'Lunes', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Martes', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Miércoles', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Jueves', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Viernes', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Sábado', horaInicio: null, horaFin: null, duracion: null },
    { dia: 'Domingo', horaInicio: null, horaFin: null, duracion: null },
]);

const esHorarioValido = (horario) => {
    return (
        horario.horaInicio &&
        horario.horaFin &&
        horario.duracion &&
        new Date(horario.horaFin) > new Date(horario.horaInicio)
    );
};

async function saveHorario() {
    if (!id_doctor.value) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un quiropráctico', life: 3000 });
        return;
    }

    const payload = {
        id_quiropractico: id_doctor.value,
        horarios: horarios.value.map((h, index) => {
            return {
                dia: index, // 0 = lunes, 6 = domingo
                hora_inicio: h.horaInicio ? h.horaInicio.toTimeString().slice(0, 5) : null,
                hora_fin: h.horaFin ? h.horaFin.toTimeString().slice(0, 5) : null,
                duracion: h.duracion ?? null
            };
        })
    };

    try {
        await upsertHorarios(payload);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Horarios guardados correctamente', life: 3000 });
    } catch (error) {
        console.error('Error al guardar horarios:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los horarios', life: 3000 });
    }
}

watch(id_doctor, async (nuevoId) => {
    if (!nuevoId) return;

    try {
        const data = await getHorariosMedico(nuevoId);

        if (!Array.isArray(data)) {
            throw new Error('La respuesta del backend no es un array');
        }

        horarios.value = [
            'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
        ].map((dia, index) => {
            const encontrado = data.find(h => h.dia === index);
            return {
                dia,
                horaInicio: encontrado?.hora_inicio
                    ? new Date(`1970-01-01T${encontrado.hora_inicio}`)
                    : null,
                horaFin: encontrado?.hora_fin
                    ? new Date(`1970-01-01T${encontrado.hora_fin}`)
                    : null,
                duracion: encontrado?.duracion ?? null
            };
        });

    } catch (error) {
        console.error('❌ Error al cargar horarios del médico:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los horarios',
            life: 3000
        });
    }
});

onMounted(() => {
    cargarDoctores();
});

</script>

<template>
    <div>
        <div class="card">
            <div class="flex flex-col gap-6">
                <h4 class="m-0">Horarios</h4>
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-12">
                        <label for="id_doctor" class="block font-bold mb-3">Quiropráctico</label>
                        <Select id="id_doctor" v-model="id_doctor" :options="doctores" filter optionLabel="label" optionValue="value" 
                        placeholder="Seleccione quiropráctico" fluid />
                    </div>
                </div>
                <DataTable 
                    ref="dt" 
                    :value="horarios"
                    data-key="id" 
                    editMode="cell" class="editable-cells-table">
                    <Column field="dia" header="Día"></Column>
                    <Column field="horaInicio" header="Hora Inicio">
                        <template #body="slotProps">
                            <DatePicker v-model="slotProps.data.horaInicio" showTime hourFormat="24" timeOnly fluid />
                        </template>
                    </Column>
                    <Column field="horaFin" header="Hora Fin">
                        <template #body="slotProps">
                            <DatePicker v-model="slotProps.data.horaFin" showTime hourFormat="24" timeOnly fluid/>
                        </template>
                    </Column>
                    <Column field="duracion" header="Duración (minutos)">
                        <template #body="slotProps">
                            <InputNumber v-model="slotProps.data.duracion" suffix=" min" fluid/>
                        </template>
                    </Column>
                    <Column header="Estado">
                        <template #body="slotProps">
                            <div v-if="esHorarioValido(slotProps.data)" class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-green-500"></i>
                                <Badge value="Activo" severity="success" />
                            </div>
                            <div v-else class="text-gray-400 text-sm">
                                Incompleto
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-12 flex justify-end">
                        <Button label="Guardar" icon="pi pi-check" @click="saveHorario" />
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>