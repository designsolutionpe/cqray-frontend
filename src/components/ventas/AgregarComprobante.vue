<script setup>
import { ref, onMounted, watch } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const dt = ref();

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

const comprobante = ref({});

</script>

<template>
    <div>
        <div class="card p-4">
            <h2 class="text-xl font-semibold mb-4">{{ tipoComprobanteText(tipoComprobanteProp.tipoComprobante) }}</h2>

            <div class="grid grid-cols-12 gap-3">

                <div class="col-span-6">
                    <label for="tipo" class="block font-bold mb-3">Tipo</label>
                    <Select id="tipo" v-model="comprobante.tipo" :options="[{ label: 'Producto', value: 1 }, { label: 'Servicio', value: 2 }]" optionLabel="label" optionValue="value" placeholder="Selecciona un tipo" fluid />
                </div>
            </div>

            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-6">
                    <label for="id_persona" class="block font-bold mb-3">Persona</label>
                    <Select id="id_persona" v-model="comprobante.id_persona" :options="productosServicios" optionLabel="label" optionValue="value" placeholder="Selecciona una persona" fluid />
                </div>

            <div class="col-span-6">
                <label for="serie" class="block font-bold mb-3">Serie</label>
                <InputText id="serie" v-model="comprobante.serie" type="text" placeholder="Serie del comprobante" fluid />
            </div>

            <div class="col-span-6">
              <label for="numero" class="block font-bold mb-3">Número</label>
              <InputText id="numero" v-model="comprobante.numero" type="text" placeholder="Número del comprobante" fluid />
            </div>

            <div class="col-span-6">
              <label for="fecha_emision" class="block font-bold mb-3">Fecha de emisión</label>
              <InputText id="fecha_emision" v-model="comprobante.fecha_emision" type="date" placeholder="Fecha de emisión" fluid />
            </div>

            <div class="col-span-6">
              <label for="moneda" class="block font-bold mb-3">Moneda</label>
              <Select id="moneda" v-model="comprobante.moneda" :options="[{ label: 'PEN', value: 'PEN' }, { label: 'USD', value: 'USD' }]" optionLabel="label" optionValue="value" placeholder="Selecciona la moneda" fluid />
            </div>
        </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-6">
          <label for="tipo_cambio" class="block font-bold mb-3">Tipo de cambio</label>
          <InputText id="tipo_cambio" v-model="comprobante.tipo_cambio" type="number" step="0.01" placeholder="Tipo de cambio" fluid />
        </div>

        <div class="col-span-6">
          <label for="igv" class="block font-bold mb-3">IGV</label>
          <Checkbox id="igv" v-model="comprobante.igv" binary />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-6">
          <label for="subtotal" class="block font-bold mb-3">Subtotal</label>
          <InputText id="subtotal" v-model="comprobante.subtotal" type="number" step="0.01" placeholder="Subtotal" fluid />
        </div>

        <div class="col-span-6">
          <label for="monto_igv" class="block font-bold mb-3">Monto IGV</label>
          <InputText id="monto_igv" v-model="comprobante.monto_igv" type="number" step="0.01" placeholder="Monto IGV" fluid />
        </div>

        <div class="col-span-6">
          <label for="descuento" class="block font-bold mb-3">Descuento</label>
          <InputText id="descuento" v-model="comprobante.descuento" type="number" step="0.01" placeholder="Descuento" fluid />
        </div>

        <div class="col-span-6">
          <label for="total" class="block font-bold mb-3">Total</label>
          <InputText id="total" v-model="comprobante.total" type="number" step="0.01" placeholder="Total" fluid />
        </div>
      </div>

      <!-- Pagos -->
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-6">
          <label for="pago_cliente" class="block font-bold mb-3">Pago Cliente</label>
          <InputText id="pago_cliente" v-model="comprobante.pago_cliente" type="number" step="0.01" placeholder="Pago Cliente" fluid />
        </div>

        <div class="col-span-6">
          <label for="vuelto" class="block font-bold mb-3">Vuelto</label>
          <InputText id="vuelto" v-model="comprobante.vuelto" type="number" step="0.01" placeholder="Vuelto" fluid />
        </div>
      </div>
      
      <div class="mt-4">
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveComprobante" />
      </div>
    </div>
    </div>
</template>