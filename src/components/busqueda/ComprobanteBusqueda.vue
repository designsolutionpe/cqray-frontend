<script setup>
import { ref, watch } from 'vue';
import { getBuscarComprobantes } from '@/service/gestion/ComprobanteService';

const props = defineProps({
    serie: String,
    numero: String,
    showDialog: Boolean
});

const emit = defineEmits();

const comprobantes = ref([]);
// Variables reactivas para la búsqueda
const serie = ref(props.serie);
const numero = ref(props.numero);
const showDialog = ref(props.showDialog);
const filteredComprobantes = ref([]);

// Función para realizar la búsqueda
const searchComprobantes = async () => {
    if (serie || numero) {
        try {
            const response = await getBuscarComprobantes({
            serie: serie.value,
            numero: numero.value
        });
        comprobantes.value = response?.data || [];
        filteredComprobantes.value = response?.data || [];
        } catch (error) {
            console.error('Error al buscar comprobantes desde la API:', error);
        }
    }
};

const selectedComprobante = ref(null);

// Emitir el comprobante seleccionado al componente padre
const selectComprobante = () => {
  if (selectedComprobante.value) {
    emit('select-comprobante', selectedComprobante.value);
    emit('update:visible', false);
  }
};

watch( () => props.showDialog, (newVal) => {
    showDialog.value = newVal;
})

</script>

<template>
    <Dialog header="Seleccionar Comprobante" :style="{ 'width': '650px' }" v-model:visible="showDialog" :modal="true" :closable="true">
        <InputGroup>
            <InputText v-model="serie" placeholder="Serie" fluid />
            <InputText v-model="numero" placeholder="Número" fluid />
            <InputGroupAddon v-if="(serie || numero)">
                <Button icon="pi pi-search" severity="secondary" variant="text" @click="searchComprobantes" />
            </InputGroupAddon> 
        </InputGroup>

        <!-- DataTable de resultados -->
        <DataTable v-if="(serie || numero)" v-model:selection="selectedComprobante" :value="filteredComprobantes" dataKey="id">
            <Column selectionMode="single" headerStyle="width: 3rem"></Column>
            <Column field="id" header="#" style="min-width: 3rem" />
            <Column field="serie" header="Serie" style="min-width: 4rem"/>
            <Column field="numero" header="Número" style="min-width: 4rem"/>
            <Column header="Nombre Completo" style="min-width: 12rem">
                <template #body="slotProps">
                    {{  slotProps.data.persona.apellido + ' ' + slotProps.data.persona.nombre }}
                </template>
            </Column>
        </DataTable>

        <!-- Footer con botón de "Guardar" -->
        <template #footer>
            <Button label="Aceptar" icon="pi pi-check" @click="selectComprobante" />
        </template>
    </Dialog>
</template>