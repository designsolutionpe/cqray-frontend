<script setup>
import Preloader from '@/components/Preloader.vue';
import { createComprobante } from '@/service/gestion/ComprobanteService';
import { searchArticulos } from '@/service/mantenimiento/ArticulosService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import PersonaBusqueda from '@/components/busqueda/PersonaBusqueda.vue';

const store = useStore()
const toast = useToast();
const id_sede = computed(() => store.getters.id_sede)

const comprobante = ref({})
const crearDetalleVacio = () => ({
    id_articulo: null,
    cantidad: 1,
    descuento: 0,
    precio_unitario: 0,
    total_producto: 0
});

const detalles = ref([crearDetalleVacio()]);

const agregarFila = () => {
    detalles.value.push(crearDetalleVacio());
};

const productos = ref([]);

const obtenerProductos = async () => {
  try {
    const data = await searchArticulos(comprobante.value.id_sede, comprobante.value.tipo);
    if (data && data.length > 0) {
      productos.value = data.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio_venta || 0,
      }));
    } else {
      productos.value = []; // En caso de que no haya productos
    }
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
};
const obtenerNombreProducto = (id) => {
    const producto = productos.value.find(p => p.id === id);
    return producto ? producto.nombre : '';
};

const onCellEditComplete = (event) => {
    const { data, newValue, field } = event;
    if (field === 'id_articulo') {
        data[field] = newValue;
        // Autocompletar precio si se selecciona un producto
        const producto = productos.value.find(p => p.id === newValue);
        if (producto) {
            data.precio_unitario = producto.precio;
        }
    } else {
        data[field] = newValue;
    }

    // Recalcular total de esa fila
    const subtotal = data.precio_unitario * data.cantidad;
    const descuento = subtotal * (data.descuento / 100);
    data.total_producto = subtotal - descuento;

    // Recalcular totales del comprobante
    recalcularTotales();
};

const recalcularTotales = () => {
  let subtotal = 0;
  let totalDescuento = 0;

  detalles.value.forEach(detalle => {
    const lineaSubtotal = detalle.precio_unitario * detalle.cantidad;
    const lineaDescuento = lineaSubtotal * (detalle.descuento / 100);

    subtotal += lineaSubtotal;
    totalDescuento += lineaDescuento;

    // Total por fila
    detalle.total_producto = lineaSubtotal - lineaDescuento;
  });

  const totalSinIGV = detalles.value.reduce((acc, item) => acc + Number(item.total_producto), 0);
  const montoIGV = comprobante.value.igv ? totalSinIGV * 0.18 : 0;
  const total = totalSinIGV + montoIGV;

  comprobante.value.subtotal = subtotal.toFixed(2); // solo por referencia
  comprobante.value.descuento = totalDescuento.toFixed(2);
  comprobante.value.monto_igv = montoIGV.toFixed(2);
  comprobante.value.total = total.toFixed(2);
};

const eliminarFila = (index) => {
    detalles.value.splice(index, 1);
    recalcularTotales();
};

const limpiarDetalles = () => {
    detalles.value = [crearDetalleVacio()];
    recalcularTotales();
};

const formatCurrency = (value, moneda = 'PEN') => {
    const currencyOptions = {
        USD: { style: 'currency', currency: 'USD', locale: 'en-US' },
        PEN: { style: 'currency', currency: 'PEN', locale: 'es-PE' }
    };

    const { style, currency, locale } = currencyOptions[moneda] || currencyOptions['USD'];
    return new Intl.NumberFormat(locale, { style, currency }).format(value || 0);
};

const cancelToken = ref()
const aSedeSelect = ref([])
const isSedeLoading = ref(true)
const isPageLoading = ref(true)

const cargarSedes = async () => {
  isSedeLoading.value = true
  try {
    const response = await getSedes(cancelToken.value.token)
    if (response) {
      aSedeSelect.value = response.map(s => ({
        label: s.nombre,
        value: s.id
      }))
      comprobante.value.id_sede = aSedeSelect.value.find(s => s.value == id_sede.value)?.value || null
    }
    isSedeLoading.value = false
  }
  catch (error) {
    handleServerError(error, 'sedes', toast)
  }
}

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

const tipo = [
  { label: 'Producto', value: 1 },
  { label: 'Servicio', value: 2 }
];

const optMoneda = [
  { label: 'PEN', value: 'PEN' }, 
  { label: 'USD', value: 'USD' }
]

//Datos de persona
const showDialog = ref(false);
const selectedPersona = ref(null);
const numeroDocumento = ref('');
const nombre = ref('');

const openDialog = () => {
  showDialog.value = true;
};

const handleSelectPersona = (persona) => {
    selectedPersona.value = persona;
    numeroDocumento.value = persona.numeroDocumento;
    nombre.value = persona.nombre;
    comprobante.value.id_persona = persona.id;
    comprobante.value.nombre = `${persona.tipo_documento} ${persona.numero_documento} ${persona.nombreCompleto}`;
    showDialog.value = false;
};

watch([
  isSedeLoading,
], () => {
  if (
    isSedeLoading.value
  )
    isPageLoading.value = true
  else
    isPageLoading.value = false
})

watch(() => comprobante.value.igv, () => {
  recalcularTotales();
});

watch(
  () => [comprobante.value.id_sede, comprobante.value.tipo], 
  ([idSede, tipoArticulo]) => {
    if (idSede && tipoArticulo) {
      obtenerProductos();
    }
  },
  { immediate: true }
);

const calculateVuelto = computed(() => {
  return (comprobante.value.pago_cliente - comprobante.value.total).toFixed(2);
});

function hideDialog(){

}

async function saveComprobante() {
  try {
    const response = await createComprobante(comprobante.value, detalles.value, cancelToken.value.token)
    if (response) {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Comprobante creado', life: 3000 });
      // Limpiar los campos después de guardar
      comprobante = ref({});
      detalles = ref([{}]);
    }
  } catch (error) {
    handleServerError(error, 'comprobante', toast)
  }
}

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarSedes()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>

<template>
  <div>
    <div class="card p-4">
      <h2 class="text-xl font-semibold mb-4">
        {{ tipoComprobanteText(tipoComprobanteProp.tipoComprobante) }}
      </h2>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-8">
          <label for="nomb" class="block font-bold mb-3">Nombre</label>
          <InputGroup>
            <InputText id="nomb" v-model="comprobante.nombre" readonly fluid />
            <InputGroupAddon>
              <Button icon="pi pi-list" severity="info" variant="text" @click="openDialog" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <PersonaBusqueda :showDialog="showDialog" @select-persona="handleSelectPersona"
        :numeroDocumento="numeroDocumento" :nombre="nombre" @update:visible="showDialog = $event"/>
        <div class="col-span-4">
          <label for="sede" class="block font-bold mb-3">Sede</label>
          <Select id="sede" v-model="comprobante.id_sede" fluid :options="aSedeSelect"
          option-label="label" option-value="value" placeholder="Seleccionar sede" />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-4">
          <label for="tipo" class="block font-bold mb-3">Tipo</label>
          <Select id="tipo" v-model="comprobante.tipo" :options="tipo" optionLabel="label" optionValue="value" placeholder="Selecciona un tipo" fluid />
        </div>

        <div class="col-span-2">
          <label for="serie" class="block font-bold mb-3">Serie</label>
          <InputText id="serie" v-model="comprobante.serie" type="text" placeholder="Serie" fluid />
        </div>

        <div class="col-span-3">
          <label for="numero" class="block font-bold mb-3">Número</label>
          <InputText id="numero" v-model="comprobante.numero" type="text" placeholder="Número del comprobante" fluid />
        </div>

        <div class="col-span-3">
          <label for="fecha_emision" class="block font-bold mb-3">Fecha de emisión</label>
          <InputText id="fecha_emision" v-model="comprobante.fecha_emision" type="date" placeholder="Fecha de emisión" fluid />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-3">
          <label for="moneda" class="block font-bold mb-3">Moneda</label>
          <Select id="moneda" v-model="comprobante.moneda" :options="optMoneda" optionLabel="label" optionValue="value" placeholder="Selecciona la moneda" fluid />
        </div>
        <div class="col-span-3">
          <label for="tipo_cambio" class="block font-bold mb-3">Tipo de cambio</label>
          <InputText id="tipo_cambio" v-model="comprobante.tipo_cambio" type="number" step="0.01" placeholder="Tipo de cambio" fluid />
        </div>
        <div class="col-span-2">
          <label for="igv" class="block font-bold mb-3">IGV</label>
          <Checkbox id="igv" v-model="comprobante.igv" binary />
        </div>
      </div>

      <Card class="p-mb-4 custom-card gap-6 mb-6">
        <template #content>
          <div class="flex gap-2 mb-3">
            <Button label="Agregar detalle" icon="pi pi-plus" @click="agregarFila" />
            <Button label="Limpiar detalles" icon="pi pi-refresh" severity="secondary" @click="limpiarDetalles" />
          </div>
          
          <DataTable :value="detalles" editMode="cell" @cell-edit-complete="onCellEditComplete"
            :pt="{ table: { style: 'min-width: 50rem' } }">
            <Column field="id_articulo" header="Producto" style="width: 25%">
                <!--
                <template #body="{ data }">
                  {{ obtenerNombreProducto(data.id_articulo) || 'Seleccionar producto' }}
                </template>
                -->
                <template #editor="{ data, field }">
                  <Select v-model="data[field]" :options="productos" option-label="nombre" 
                  placeholder="Seleccionar producto" option-value="id" filter fluid />
                </template>
            </Column>

            <Column field="cantidad" header="Cantidad" style="width: 15%">
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" :min="1" autofocus />
                </template>
            </Column>

            <Column field="descuento" header="Descuento (%)" style="width: 15%">
                <template #editor="{ data, field }">
                    <InputNumber v-model="data[field]" :min="0" :max="100" autofocus />
                </template>
            </Column>

            <Column field="precio_unitario" header="Precio Unitario" style="width: 20%">
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" autofocus/>
              </template>
            </Column>


            <Column field="total_producto" header="Total" style="width: 20%">
                <template #body="{ data }">
                    {{ formatCurrency(data.total_producto, comprobante.moneda) }}
                </template>
            </Column>

            <Column header="Acciones" style="width: 10%">
              <template #body="{ index }">
                <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="eliminarFila(index)" />
              </template>
            </Column>

          </DataTable>
        </template>
      </Card>

      <div class="grid grid-cols-12 gap-6 mb-2">
        <!-- Columna 1 -->
        <div class="col-span-6 pr-6">
          <div class="grid grid-cols-2 gap-4">
            <!-- Subtotal -->
            <div class="col-span-1">
              <label for="subtotal" class="block font-bold mb-3">Subtotal</label>
            </div>
            <div class="col-span-1">
              <InputText id="subtotal" v-model="comprobante.subtotal" type="number" step="0.01" readonly fluid />
            </div>

            <!-- Monto IGV -->
            <div class="col-span-1">
              <label for="monto_igv" class="block font-bold mb-3">Monto IGV</label>
            </div>
            <div class="col-span-1">
              <InputText id="monto_igv" v-model="comprobante.monto_igv" type="number" step="0.01" readonly fluid />
            </div>

            <!-- Descuento -->
            <div class="col-span-1">
              <label for="descuento" class="block font-bold mb-3">Descuento</label>
            </div>
            <div class="col-span-1">
              <InputText id="descuento" v-model="comprobante.descuento" type="number" step="0.01" readonly fluid />
            </div>

            <!-- Total -->
            <div class="col-span-1">
              <label for="total" class="block font-bold mb-3">Total</label>
            </div>
            <div class="col-span-1">
              <InputText id="total" v-model="comprobante.total" type="number" step="0.01" readonly fluid />
            </div>
          </div>
        </div>

        <!-- Columna 2 -->
        <div class="col-span-6 pl-6">
          <div class="grid grid-cols-2 gap-4">
            <!-- Pago Cliente -->
            <div class="col-span-1">
              <label for="pago_cliente" class="block font-bold mb-3">Pago Cliente</label>
            </div>
            <div class="col-span-1">
              <InputText id="pago_cliente" v-model="comprobante.pago_cliente" type="number" step="0.01" fluid />
            </div>

            <!-- Vuelto -->
            <div class="col-span-1">
              <label for="vuelto" class="block font-bold mb-3">Vuelto</label>
            </div>
            <div class="col-span-1">
              <InputText id="vuelto" :value="calculateVuelto" type="number" step="0.01" readonly fluid />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveComprobante" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-card {
  border: 2px solid var(--p-primary-color); /* Usando el color primario del tema de PrimeVue */
  border-radius: var(--p-card-border-radius); /* Mantiene el radio de bordes por defecto */
}
</style>