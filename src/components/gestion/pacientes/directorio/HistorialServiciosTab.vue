<script setup>
import { formatTime } from '@/utils/Util';
import { ref, watch } from 'vue';


const props = defineProps({
  aServicios: {
    type: Array,
    required: true
  }
});

const rows = ref([])
const expandedRows = ref([])

const getEstadoPago = (item, target) => {
  switch (item) {
    case 0:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Pendiente'
    case 1:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Pagado'
    case 2:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Deuda'
  }
}

const getEstadoCita = (item, target) => {
  switch (item) {
    case 1:
      if (target == 'severity') return 'warn'
      else if (target == 'text') return 'Confirmacion pendiente'
    case 2:
      if (target == 'severity') return 'info'
      else if (target == 'text') return 'Confirmado'
    case 3:
      if (target == 'severity') return 'success'
      else if (target == 'text') return 'Atendido'
    case 4:
      if (target == 'severity') return 'danger'
      else if (target == 'text') return 'Cancelado'
    default:
      if (target == 'severity') return 'secondary'
      else if (target == 'text') return 'Sin definir'
  }
}

watch(
  () => props.aServicios,
  (servicios) => {
    if (servicios) {
      console.log("servicios", servicios)
      rows.value = servicios.map(e => {
        let r = {
          sede: e[0].sede.nombre,
          paquete: e[0].paquete.nombre,
          estado_pago: e[0].estado_pago,
          activo: e[0].activo,
          items: e
        }
        return r
      })
      console.log('rows', rows.value)
    }
  }
)

</script>
<template>
  <DataTable v-model:expanded-rows="expandedRows" :value="rows" removable-sort table-style="min-width: 20rem" scrollable
    scroll-height="400px" show-gridlines>
    <template #empty>
      <p class="text-center font-bold">No hay paquetes adquiridos</p>
    </template>

    <Column expander style="width: 1rem;"></Column>
    <Column field="sede" header="Sede" sortable style="min-width: 5rem;"></Column>
    <Column field="paquete" header="Paquete" sortable style="min-width: 8rem;"></Column>
    <Column field="estado_pago" header="Estado de pago" sortable style="min-width: 8rem;">
      <template #body="item">
        <Tag :severity="getEstadoPago(item.data.estado_pago, 'severity')">
          {{ getEstadoPago(item.data.estado_pago, 'text') }}
        </Tag>
      </template>
    </Column>
    <Column field="activo" header="Estado" sortable style="min-width: 8rem;">
      <template #body="item">
        <Tag :severity="item.data.activo ? 'success' : 'secondary'">
          {{ item.data.activo ? 'Activo' : 'Inactivo' }}
        </Tag>
      </template>
    </Column>

    <template #expansion="expanded">
      <DataTable :value="expanded.data.items" removable-sort table-style="min-width: 10rem" data-key="id"
        show-gridlines>
        <Column header="#" sortable style="min-width: 1rem">
          <template #body="item">
            {{ item.index + 1 }}
          </template>
        </Column>
        <Column header="Fecha de atención" sortable style="min-width: 5rem">
          <template #body="item">
            {{ item.data.cita ? item.data.cita.fecha_cita : '---' }}
          </template>
        </Column>
        <Column header="Hora de atención" sortable style="min-width: 5rem">
          <template #body="item">
            {{ item.data.cita ? formatTime(item.data.cita.hora_cita) : '---' }}
          </template>
        </Column>
        <Column header="Estado de Cita" sortable style="min-width: 8rem">
          <template #body="item">
            <Tag :severity="getEstadoCita(item.data.cita ? item.data.cita.estado : null, 'severity')">
              {{ getEstadoCita(item.data.cita ? item.data.cita.estado : null, 'text') }}
            </Tag>
          </template>
        </Column>
      </DataTable>
    </template>

  </DataTable>
</template>