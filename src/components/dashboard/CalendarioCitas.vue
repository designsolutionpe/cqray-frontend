<script setup>
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { getCitasPorFecha } from '@/service/gestion/CitaService.js';
import axios from 'axios'
import { FilterMatchMode } from '@primevue/core/api';
import { useStore } from 'vuex'
import { formatDate } from '@/utils/Util.js'

const store = useStore()
const cancelToken = ref()
const isCitasLoading = ref(true)
const selectedYear = ref(new Date().getFullYear())
const id_sede = computed(() => store.getters.id_sede)

const selectedDate = ref(null);
const dialogVisible = ref(false);
const citasTable = ref([])
const eventsData = ref([])
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const estadoClases = {
  'confirmación pendiente': 'badge badge-pendiente',
  'confirmado': 'badge badge-confirmado',
  'atendido': 'badge badge-atendido',
  'cancelado': 'badge badge-cancelado'
};

const estadoLabels = {
  'confirmación pendiente': 'Pendiente',
  'confirmado': 'Confirmada',
  'atendido': 'Atendida',
  'cancelado': 'Cancelada'
};

const estadoOrden = {
  'confirmación pendiente': 1,
  'confirmado': 2,
  'atendido': 3,
  'cancelado': 4
};

const cargarCitas = async () => {
  isCitasLoading.value = true;

  try {
    const response = await getCitasPorFecha(
      selectedYear.value,
      id_sede.value || null,
      cancelToken.value.token
    );

    if (response) {
      citasTable.value = response.map(cita => ({
        ...cita,
        hora_cita_12: cita.hora_cita ? new Date(cita.fecha_cita + 'T' + cita.hora_cita).toLocaleTimeString('es-PE', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
    })
  : null

      }));
      generarEventosDesdeCitas(citasTable.value)
    }
    isCitasLoading.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      severity: 'error',
      summary: 'Error de carga',
      detail: 'Hubo un error obteniendo las citas',
      life: 3000
    });
    isCitasLoading.value = false;
  }
};

const generarEventosDesdeCitas = (citas) => {
  const conteo = {}

  citas.forEach(cita => {
    const key = `${cita.fecha_cita}-${cita.estado_nombre.toUpperCase()}`

    if (!conteo[key]) {
      conteo[key] = {
        date: cita.fecha_cita,
        status: cita.estado_nombre.toUpperCase(),
        count: 0
      }
    }

    conteo[key].count++
  })

  // Convertir el objeto a array
  eventsData.value = Object.values(conteo)
}


// Config. localización
const spanishLocale = {
  firstDayOfWeek: 1,
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
  monthNames: [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  dateFormat: 'dd/mm/yy'
};


function onDateSelect(dateValue) {
  selectedDate.value = dateValue;
  dialogVisible.value = true;
}

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return '—';
  const yyyy = selectedDate.value.getFullYear();
  const mm = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.value.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
});

const citasForSelectedDate = computed(() => {
  return citasTable.value.filter(c => c.fecha_cita === selectedDateFormatted.value);
});

const getEventsFor = (date) => {
  const yyyy = date.year;
  const mm = String(date.month + 1).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  const key = `${yyyy}-${mm}-${dd}`;
  return eventsData.value.filter(e => e.date === key);
};

const getSeverity = (estado) => {
  const badgeClasses = {
    'Confirmación pendiente': 'badge-pendiente',  // Naranja
    'Confirmado': 'badge-confirmado',             // Azul
    'Atendido': 'badge-atendido',                 // Verde
    'Cancelado': 'badge-cancelado'                // Rojo
  };
  return badgeClasses[estado] || 'badge';  // 'badge' como valor por defecto
};
onBeforeMount(() => {
  cancelToken.value = axios.CancelToken.source()
})

onMounted(() => {
    cargarCitas()
})

onBeforeUnmount(() => {
  cancelToken.value.cancel()
})

</script>

<template>
    <div class="flex items-center mb-0">
        <div class="block text-2xl font-bold text-secondary">Calendario de Citas</div>
    </div>
    <div class="card flex justify-center mb-0">
        <DatePicker v-model="selectedDate" @dateSelect="onDateSelect" inline class="big-calendar w-full sm:w-[50rem]"
        :locale="spanishLocale"
        :pt="{
            day: (options) => {
                const date = options.context.date;
                const isSelected = options.context.selected;
                const dayClass = isSelected ? 'selected-day' : '';
                const events = getEventsFor(date);

                const badges = events.slice()
                    .sort((a, b) => {
                        const idA = estadoOrden[a.status.toLowerCase()] || 999;
                        const idB = estadoOrden[b.status.toLowerCase()] || 999;
                        return idA - idB;
                        })
                    .map(e => {
                        const key = e.status.toLowerCase();
                        const clase = estadoClases[key] || 'badge';
                        const label = estadoLabels[key] || e.status;
                        return `<span class='${clase}'>${label} (${e.count})</span>`;
                    })
                .join('');               

                return {
                    innerHTML: `
                    <div class='day-wrapper ${dayClass}'>
                        <strong>${date.day}</strong>
                        <div class='event-badges'>${badges}</div>
                    </div>`
                };
            }
        }"
        />
    </div>

    <Dialog v-model:visible="dialogVisible" :style="{ width: '800px' }"
    :modal="true" :header="`Listado de citas - Fecha: ${formatDate(selectedDateFormatted)}`">
        <div v-if="citasForSelectedDate.length">
            <DataTable
            ref="dt"
            :value="citasForSelectedDate"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            :rowsPerPageOptions="[5, 10, 20]"
            :sortField="'hora_cita'"
            :sortOrder="1"
            size="small"
            paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
            currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} citas"
            >
                <Column field="paciente" header="Paciente" sortable :style="{ width: '31%' }">
                    <template #body="slotProps">
                        {{ slotProps.data.apellido }} {{ slotProps.data.persona_nombre }}
                    </template>
                </Column>
                <Column field="hora_cita" header="Hora" sortable :style="{ width: '14%' }">
                    <template #body="slotProps">
                        {{ slotProps.data.hora_cita_12 || '—' }}
                    </template>
                </Column>
                
                <Column field="estado_nombre" header="Estado" sortable :style="{ width: '20%' }">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado_nombre" :class="getSeverity(slotProps.data.estado_nombre)" />
                    </template>
                </Column>

                <Column field="tipo_paciente_nombre" header="Tipo" sortable :style="{ width: '18%' }"></Column>
                <Column field="sede_nombre" header="Sede" sortable :style="{ width: '17%' }"></Column>
            </DataTable>
        </div>
        <div v-else>
            <em>No hay citas para esta fecha</em>
        </div>
    </Dialog>

</template>

<style scoped>
/* Celdas del calendario */
::v-deep(.p-datepicker-day-cell) {
  vertical-align: top !important;
  padding: 0.25rem !important;
  height: 6rem !important;
  width: 6rem !important;
  box-sizing: border-box;
}

/* Día contenedor */
::v-deep(.p-datepicker-day) {
  display: flex !important;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0.25rem;
  box-sizing: border-box;
}

/* Contenedor personalizado */
::v-deep(.day-wrapper) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Número del día */
::v-deep(.day-wrapper > strong) {
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-color, #1e293b);
}

/* Cuando está seleccionado */
::v-deep(.day-wrapper.selected-day > strong) {
  color: white !important;
}

/* Contenedor de badges */
::v-deep(.event-badges) {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

/* Badge base */
::v-deep(.badge) {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 9999px;
  line-height: 1;
}

/* Confirmación pendiente */
::v-deep(.badge-pendiente) {
  background-color: #fde68a; /* amarillo claro */
  color: #92400e;            /* amarillo oscuro (texto) */
}

/* Confirmado */
::v-deep(.badge-confirmado) {
  background-color: #93c5fd; /* azul claro */
  color: #1e3a8a;            /* azul oscuro (texto) */
}

/* Atendido */
::v-deep(.badge-atendido) {
  background-color: #bbf7d0; /* verde claro */
  color: #166534;            /* verde oscuro (texto) */
}

/* Cancelado */
::v-deep(.badge-cancelado) {
  background-color: #fecaca; /* rojo claro */
  color: #7f1d1d;            /* rojo oscuro (texto) */
}

/* Ajuste visual sobre fondo azul */
::v-deep(.p-datepicker-day.p-highlight .badge) {
  filter: brightness(1.05);
  opacity: 0.95;
}
</style>
