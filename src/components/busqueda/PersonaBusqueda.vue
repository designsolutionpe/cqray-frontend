<script setup>
import { ref, watch } from 'vue';
import { getBuscarPersonas } from '@/service/mantenimiento/PersonaService';

const props = defineProps({
    numeroDocumento: String,
    nombre: String,
    idPersona: Number,
    showDialog: Boolean
});

// Emite los datos seleccionados al componente padre
const emit = defineEmits();

const personas = ref([]);
// Variables reactivas para la búsqueda
const numeroDocumento = ref(props.numeroDocumento);
const nombre = ref(props.nombre);
const idPersona = ref(props.idPersona);
const showDialog = ref(props.showDialog);
const filteredPersonas = ref([]);

// Función para realizar la búsqueda
const searchPersonas = async () => {
    if (numeroDocumento || nombre) {  
        try {
            const data = await getBuscarPersonas({
            nombre: nombre.value,
            numero_documento: numeroDocumento.value,
            id_persona: idPersona.value
        });
        personas.value = data;
        filteredPersonas.value = data; 
        } catch (error) {
            console.error('Error al buscar personas desde la API:', error);
        }
    }
};


const selectedPersona = ref(null);

// Emitir la persona seleccionada al componente padre
const selectPersona = () => {
  if (selectedPersona.value) {
    emit('select-persona', selectedPersona.value);
    emit('update:visible', false);
  }
};

watch( () => props.showDialog, (newVal) => {
    showDialog.value = newVal;
})

</script>

<template>
    <Dialog header="Seleccionar Persona" :style="{ 'width': '650px' }" v-model:visible="showDialog" :modal="true" :closable="true">
        <InputGroup>
            <InputText v-model="numeroDocumento" placeholder="Número Documento" fluid />
            <InputText v-model="nombre" placeholder="Nombre" fluid />
            <InputGroupAddon v-if="(numeroDocumento || nombre)">
                <Button icon="pi pi-search" severity="secondary" variant="text" @click="searchPersonas" />
            </InputGroupAddon> 
        </InputGroup>

        <!-- DataTable de resultados -->
        <DataTable v-if="(numeroDocumento || nombre)" v-model:selection="selectedPersona" :value="filteredPersonas" dataKey="id">
            <Column selectionMode="single" headerStyle="width: 3rem"></Column>
            <Column field="id" header="#" style="min-width: 3rem" />
            <Column field="tipo_documento" header="Tipo Documento" style="min-width: 4rem"/>
            <Column field="numero_documento" header="Número Documento" style="min-width: 4rem"/>
            <Column field="nombreCompleto" header="Nombre Completo" style="min-width: 12rem" />
        </DataTable>

        <!-- Footer con botón de "Guardar" -->
        <template #footer>
            <Button label="Aceptar" icon="pi pi-check" @click="selectPersona" />
        </template>
    </Dialog>
</template>