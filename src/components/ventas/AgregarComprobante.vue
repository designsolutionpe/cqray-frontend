<script setup>
import PersonaBusqueda from '@/components/busqueda/PersonaBusqueda.vue';
import Preloader from '@/components/Preloader.vue';
import { createComprobante, getUltimoComprobante } from '@/service/gestion/ComprobanteService';
import { searchArticulos } from '@/service/mantenimiento/ArticulosService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { getTiposPagos } from '@/service/mantenimiento/TipoPagoService';
import { handleServerError } from '@/utils/Util';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore()
const toast = useToast();
const id_sede = computed(() => store.getters.id_sede)

const comprobante = ref({})
const crearDetalleVacio = () => ({
  id_articulo: null,
  cantidad: 1,
  descuento: null,
  precio_unitario: null,
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
  let { newData, index } = event

  if (newData.id_articulo == null) {
    toast.add({
      severity: 'error',
      summary: 'Por favor seleccione un Artículo',
      life: 5000
    })
    return
  }

  const articulo = productos.value.find(p => p.id === newData.id_articulo)

  if (newData.descuento < 0)
    newData.descuento = 0

  if (newData.precio_unitario <= 0 || newData.precio_unitario < articulo.precio)
    newData.precio_unitario = parseFloat(articulo.precio)
  // Recalcular total de esa fila
  const subtotal = newData.precio_unitario * newData.cantidad;

  if (newData.descuento > newData.precio_unitario) {
    toast.add({
      severity: 'error',
      summary: 'No se puede generar un descuento mayor al precio unitario del producto/servicio',
      life: 5000
    })
    return
  }
  // const descuento = subtotal * (newData.descuento / 100);
  newData.total_producto = subtotal - newData.descuento;

  detalles.value[index] = newData

  // Recalcular totales del comprobante
  recalcularTotales();
};

const recalcularTotales = () => {
  let totalGeneral = 0;
  let totalDescuento = 0;

  // Calcular total por cada fila y agregarlo al total general
  detalles.value.forEach(detalle => {
    totalGeneral += detalle.total_producto;
    totalDescuento += detalle.descuento;
  });

  // Verificar si el IGV está marcado
  const montoIGV = comprobante.value.igv
    ? totalGeneral - (totalGeneral / 1.18)
    : 0;

  // El subtotal es el total general menos el IGV
  const subtotal = totalGeneral - montoIGV;

  // Asignar los valores calculados al objeto comprobante
  comprobante.value.total = totalGeneral.toFixed(2); // Total general
  comprobante.value.subtotal = subtotal.toFixed(2); // Total sin IGV
  comprobante.value.descuento = totalDescuento.toFixed(2); // Total de descuento
  comprobante.value.monto_igv = montoIGV.toFixed(2); // Monto del IGV
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
const aTiposPagoSelect = ref([])
const aTiposPagoSecSelect = ref([])
const isSedeLoading = ref(true)
const isTiposPagoLoading = ref(true)
const isPageLoading = ref(true)
const showPagoSecundario = ref(false)

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

const cargarUltimoComprobante = async () => {
  try {
    const response = await getUltimoComprobante(cancelToken.value.token)
    if (response) {
      const { numero } = response
      const tipos = ['BOL', 'FAC', , 'CONST'].find((d, i) => tipoComprobanteProp.tipoComprobante == (i + 1))
      var newNumero = 1
      if (numero)
        newNumero = parseInt(numero) + 1
      comprobante.value = {
        ...comprobante.value,
        serie: tipos,
        numero: newNumero.toString().padStart(8, '0')
      }
    }
  }
  catch (error) {
    handleServerError(error, '', toast)
  }
}

const cargarTiposPago = async () => {
  isTiposPagoLoading.value = true
  try {
    const response = await getTiposPagos(cancelToken.value.token);
    if (response) {
      aTiposPagoSelect.value = response.map(t => ({
        label: t.nombre,
        value: t.id,
        disabled: false
      }))
      aTiposPagoSecSelect.value = response.map(t => ({
        label: t.nombre,
        value: t.id,
        disabled: false
      }))
    }
    isTiposPagoLoading.value = false
  }
  catch (error) {
    isTiposPagoLoading.value = false
    handleServerError(error, 'Obtener tipos de pagos', toast)
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
    3: 'Nota de Crédito',
    4: 'Constancia de Pago'
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

watch(comprobante, (c) => {
  console.log('comp', c)
})

const disableTipoPagoPrimario = ref(null)
const disableTipoPagoSecundario = ref(null)

watch(
  () => [comprobante.value.id_tipo_pago, comprobante.value.id_tipo_pago_secundario],
  ([primario, secundario]) => {
    console.log("cjeca tipo pago", primario, secundario)
    if (primario || secundario) {
      aTiposPagoSelect.value = aTiposPagoSelect.value.map(t => {
        t.disabled = (t.value == secundario)
        return t
      })
      aTiposPagoSecSelect.value = aTiposPagoSecSelect.value.map(t => {
        t.disabled = (t.value == primario)
        return t
      })
    }
  }
)

const calculateVuelto = computed(() => {
  let calc = showPagoSecundario.value ? comprobante.value.total - (comprobante.value.pago_cliente + comprobante.value.pago_cliente_secundario) : comprobante.value.total - comprobante.value.pago_cliente
  console.log('calc vuelto', calc)
  comprobante.value.vuelto = (calc < 0 ? -calc : 0).toFixed(2);
  console.log('result vuelto', comprobante.value.vuelto)
  return comprobante.value.vuelto;
});

const calculateDeuda = computed(() => {
  let calc = showPagoSecundario.value ? comprobante.value.total - (comprobante.value.pago_cliente + comprobante.value.pago_cliente_secundario) : comprobante.value.total - comprobante.value.pago_cliente
  console.log('calc deuda', calc)
  comprobante.value.deuda = (calc > 0 ? calc : 0).toFixed(2)
  console.log('result deuda', comprobante.value.deuda)
  return comprobante.value.deuda
})

watch(showPagoSecundario, (to) => {
  if (to && comprobante.value.pago_cliente > 0) {
    let res = comprobante.value.pago_cliente / 2
    comprobante.value.pago_cliente = isNaN(res) ? 0 : res
    comprobante.value.pago_cliente_secundario = isNaN(res) ? 0 : res
  }
  else{
    let primario = comprobante.value.pago_cliente, secundario = comprobante.value.pago_cliente_secundario

    if( (primario && !isNaN(primario)) && (secundario && !isNaN(secundario) ) ) {
        comprobante.value.pago_cliente += comprobante.value.pago_cliente_secundario
  }
  else{
    comprobante.value.pago_cliente = isNaN(primario) ? 0 : primario + isNaN(secundario) ? 0 : secundario
    comprobante.value.id_tipo_pago_secundario = undefined
    }
    }
})

const routeMap = {
  1: 'boleta',
  2: 'factura',
  3: 'notacredito',
  4: 'constanciapago'
};

function hideDialog() {
  const routeName = routeMap[tipoComprobanteProp.tipoComprobante];
  if (routeName) {
    router.push({ name: routeName });
  } else {
    console.warn('Tipo de comprobante no válido');
  }
}

async function saveComprobante() {
  console.log('check comprobante', comprobante.value)
  try {
    comprobante.value.tipo_comprobante = tipoComprobanteProp.tipoComprobante;
    comprobante.value.detalles = detalles.value;
    const response = await createComprobante(comprobante.value, cancelToken.value.token)
    if (response) {
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Comprobante creado', life: 3000 });
      // Limpiar los campos después de guardar
      comprobante.value = {};
      detalles.value = [{}];
      productos.value = [{}];
      window.location.reload()
    }
  } catch (error) {
    handleServerError(error, 'comprobante', toast)
  }
}

const editingRow = ref([])

onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
  cargarSedes()
  cargarTiposPago()
  cargarUltimoComprobante()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>

<template>
  <div>
    <div class="card p-4">
      <Preloader v-if="isPageLoading"></Preloader>
      <h2 class="text-xl font-semibold mb-4">
        {{ tipoComprobanteText(tipoComprobanteProp.tipoComprobante) }}
      </h2>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-12 sm:col-span-8">
          <label for="nomb" class="block font-bold mb-3">Nombre</label>
          <InputGroup>
            <InputText id="nomb" v-model="comprobante.nombre" readonly fluid />
            <InputGroupAddon>
              <Button icon="pi pi-list" severity="info" variant="text" @click="openDialog" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <PersonaBusqueda :showDialog="showDialog" @select-persona="handleSelectPersona"
          :numeroDocumento="numeroDocumento" :nombre="nombre" @update:visible="showDialog = $event" />
        <div class="col-span-12 sm:col-span-4">
          <label for="sede" class="block font-bold mb-3">Sede</label>
          <Select id="sede" v-model="comprobante.id_sede" fluid :options="aSedeSelect" option-label="label"
            option-value="value" placeholder="Seleccionar sede" />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-12 sm:col-span-6">
          <label for="tipo" class="block font-bold mb-3">Articulo de compra</label>
          <Select id="tipo" v-model="comprobante.tipo" :options="tipo" optionLabel="label" optionValue="value"
            placeholder="Selecciona un tipo" fluid />
        </div>

        <!-- <div class="col-span-2">
          <label for="serie" class="block font-bold mb-3">Serie</label>
          <InputText id="serie" v-model="comprobante.serie" type="text" placeholder="Serie" fluid />
        </div>

        <div class="col-span-3">
          <label for="numero" class="block font-bold mb-3">Número</label>
          <InputText id="numero" v-model="comprobante.numero" type="text" placeholder="Número del comprobante" fluid />
        </div> -->

        <div class="col-span-12 sm:col-span-6">
          <label for="fecha_emision" class="block font-bold mb-3">Fecha de emisión</label>
          <InputText id="fecha_emision" v-model="comprobante.fecha_emision" type="date" placeholder="Fecha de emisión"
            fluid />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6 mb-6">
        <div class="col-span-12 sm:col-span-5">
          <label for="moneda" class="block font-bold mb-3">Moneda</label>
          <Select id="moneda" v-model="comprobante.moneda" :options="optMoneda" optionLabel="label" optionValue="value"
            placeholder="Selecciona la moneda" fluid />
        </div>
        <div v-if="comprobante.moneda != 'PEN'" class="col-span-10 sm:col-span-5">
          <label for="tipo_cambio" class="block font-bold mb-3">Tipo de cambio</label>
          <InputText id="tipo_cambio" v-model="comprobante.tipo_cambio" type="number" step="0.01"
            placeholder="Tipo de cambio" fluid />
        </div>
        <div class="col-span-2">
          <label for="igv" class="block font-bold mb-3">IGV</label>
          <Checkbox id="igv" v-model="comprobante.igv" binary />
        </div>
      </div>

      <Card v-if="productos.length > 0" class="p-mb-4 custom-card gap-6 mb-6">
        <template #content>
          <div class="flex gap-2 mb-3">
            <Button label="Agregar detalle" icon="pi pi-plus" @click="agregarFila" />
            <Button label="Limpiar detalles" icon="pi pi-refresh" severity="secondary" @click="limpiarDetalles" />
          </div>

          <DataTable v-model:editing-rows="editingRow" :value="detalles" editMode="row"
            @row-edit-save="onCellEditComplete" :pt="{ table: { style: 'min-width: 50rem' } }">
            <Column field="id_articulo" header="Producto" style="width: 25%">
              <template #body="{ data }">
                <Tag>{{ obtenerNombreProducto(data.id_articulo) || 'Seleccionar producto' }}</Tag>
              </template>
              <template #editor="{ data, field }">
                <Select v-model="data[field]" :options="productos" optionLabel="nombre"
                  placeholder="Seleccionar producto" optionValue="id" filter fluid />
              </template>
            </Column>

            <Column field="cantidad" header="Cantidad" style="width: 15%">
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" :min="1" autofocus />
              </template>
            </Column>

            <Column field="descuento" header="Descuento (S/)" style="width: 15%">
              <template #body="item">S/{{ parseFloat(item.data.descuento | 0).toFixed(2) }}</template>
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="PEN" locale="es-PE" autofocus />
              </template>
            </Column>

            <Column field="precio_unitario" header="Precio Unitario" style="width: 20%">
              <template #body="item">S/{{ parseFloat(item.data.precio_unitario | 0).toFixed(2) }}</template>
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" mode="currency" currency="PEN" locale="es-PE" autofocus />
              </template>
            </Column>


            <Column field="total_producto" header="Total" style="width: 20%">
              <template #body="{ data }">
                {{ formatCurrency(data.total_producto, comprobante.moneda) }}
              </template>
            </Column>

            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>

            <Column header="Acciones" style="width: 10%">
              <template #body="{ index }">
                <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="eliminarFila(index)" />
              </template>
            </Column>

          </DataTable>
        </template>
      </Card>

      <div v-if="comprobante.total > 0" class="grid grid-cols-12 gap-6 mb-2">
        <!-- Columna 1 -->
        <div class="col-span-12 sm:col-span-6 sm:pr-6">
          <div class="grid grid-cols-2 gap-4 items-center">
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
        <div class="col-span-12 sm:col-span-6 sm:pl-6">
          <div class="grid grid-cols-2 gap-4 items-center">

            <!-- Tipo de pago -->
            <div class="col-span-1">
              <label for="tipo_pago" class="block font-bold mb-3">Tipo de Pago</label>
            </div>
            <div class="col-span-1">
              <Select id="tipo_pago" v-model="comprobante.id_tipo_pago" :options="aTiposPagoSelect" option-label="label"
                option-value="value" placeholder="Selecciona el tipo de pago" fluid option-disabled="disabled"></Select>
            </div>

            <!-- Pago Cliente -->
            <div class="col-span-1">
              <label for="pago_cliente" class="block font-bold mb-3">Pago Cliente</label>
            </div>
            <div class="col-span-1">
              <InputNumber id="pago_cliente" v-model="comprobante.pago_cliente" mode="currency" currency="PEN"
                locale="es-PE" fluid>
              </InputNumber>
            </div>

            <div v-if="showPagoSecundario" class="col-span-2 flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <label for="tipo_pago_sec" class="col-span-1 block font-bold">Tipo de Pago secundario</label>
                <Select id="tipo_pago_sec" class="col-span-1" v-model="comprobante.id_tipo_pago_secundario"
                  :options="aTiposPagoSecSelect" option-label="label" option-value="value"
                  placeholder="Selecciona el tipo de pago secundario" option-disabled="disabled"></Select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <label for="pago_cliente_sec" class="col-span-1 block font-bold">Pago Cliente secundario</label>
                <InputNumber id="pago_cliente_sec" v-model="comprobante.pago_cliente_secundario" mode="currency"
                  currency="PEN" locale="es-PE" fluid></InputNumber>
              </div>
            </div>

            <!-- Vuelto -->
            <div class="col-span-1">
              <label for="vuelto" class="block font-bold mb-3">Vuelto</label>
            </div>
            <div class="col-span-1">
              <InputText id="vuelto" :value="calculateVuelto" type="number" step="0.01" readonly fluid />
            </div>

            <!-- Deuda -->
            <div class="col-span-1">
              <label for="deuda" class="block font-bold mb-3">Deuda</label>
            </div>
            <div class="col-span-1">
              <InputText id="deuda" :value="calculateDeuda" type="number" step="0.01" readonly fluid />
            </div>

            <div class="col-span-2">
              <Button v-if="!showPagoSecundario" icon="pi pi-plus" label="Dividir pagos"
                @click="showPagoSecundario = true" fluid></Button>
              <Button v-if="showPagoSecundario" icon="pi pi-minus" label="Unificar pagos" @click="showPagoSecundario = false" fluid></Button>
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
  border: 2px solid var(--p-primary-color);
  /* Usando el color primario del tema de PrimeVue */
  border-radius: var(--p-card-border-radius);
  /* Mantiene el radio de bordes por defecto */
}
</style>