<script setup>
import IngresosEgresosWidget from '@/components/dashboard/IngresosEgresosWidget.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

/*
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];*/

const spanishLocale = {
    startsWith: 'Empieza con',
    contains: 'Contiene',
    notContains: 'No contiene',
    equals: 'Es igual a',
    notEquals: 'No es igual a',
    noFilter: 'Sin filtro',
    lt: 'Menor que',
    lte: 'Menor o igual que',
    gt: 'Mayor que',
    gte: 'Mayor o igual que',
    dateIs: 'La fecha es',
    dateIsNot: 'La fecha no es',
    dateBefore: 'La fecha es anterior a',
    dateAfter: 'La fecha es posterior a',
    clear: 'Limpiar',
    apply: 'Aplicar',
    matchAll: 'Coincidir todos',
    matchAny: 'Coincidir cualquier',
    addRule: 'Añadir regla',
    removeRule: 'Eliminar regla',
    accept: 'Aceptar',
    reject: 'Rechazar',
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    completed: 'Completado',
    pending: 'Pendiente',
    fileSizeTypes: ['Bytes', 'KB', 'MB', 'GB'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    chooseYear: 'Elegir año',
    chooseMonth: 'Elegir mes',
    chooseDate: 'Elegir fecha',
    prevDecade: 'Década anterior',
    nextDecade: 'Próxima década',
    prevYear: 'Año anterior',
    nextYear: 'Próximo año',
    prevMonth: 'Mes anterior',
    nextMonth: 'Próximo mes',
    prevHour: 'Hora anterior',
    nextHour: 'Próxima hora',
    prevMinute: 'Minuto anterior',
    nextMinute: 'Próximo minuto',
    prevSecond: 'Segundo anterior',
    nextSecond: 'Próximo segundo',
    am: 'AM',
    pm: 'PM',
    today: 'Hoy',
    weekHeader: 'Semana',
    firstDayOfWeek: 0, // Domingo
    showMonthAfterYear: false,
    dateFormat: 'dd/mm/yy',
    weak: 'Débil',
    medium: 'Medio',
    strong: 'Fuerte',
    passwordPrompt: 'Escriba la contraseña',
    emptyFilterMessage: 'No hay resultados',
    searchMessage: 'Resultados de búsqueda',
    selectionMessage: 'Elemento seleccionado',
    emptySelectionMessage: 'No se ha seleccionado ningún elemento',
    emptySearchMessage: 'No hay resultados para la búsqueda',
    emptyMessage: 'No hay elementos disponibles',
    fileChosenMessage: 'Archivo seleccionado',
    noFileChosenMessage: 'No se ha seleccionado ningún archivo',
    aria: {
        datePicker: 'Selector de fecha',
        calendar: 'Calendario',
        prevMonth: 'Mes anterior',
        nextMonth: 'Próximo mes',
        prevYear: 'Año anterior',
        nextYear: 'Próximo año',
    }
};

const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const dayNames = [
    'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'
];


const citasDates = ref({
    '2025-03-05': 3,
    '2025-03-07': 5,
    '2025-03-10': 2,
    '2025-03-12': 7,
    '2025-03-15': 1,
    '2025-03-18': 2
});

const selectedDate = ref(null);
const citasCount = ref(0);
const citasDetails = ref([]);
const toast = useToast();

const showCitasDetails = () => {
    toast.add({ severity: 'info', summary: 'Detalles de Citas', detail: `Mostrar citas para el día ${selectedDate.value}`, life: 3000 });
};

const handleDateClick = (date) => {
    const formattedDate = formatDate(date);

    if (citasDates.value[formattedDate]) {
        selectedDate.value = formattedDate;
        citasCount.value = citasDates.value[formattedDate];
        citasDetails.value = ["Cita 1", "Cita 2", "Cita 3"];
    } else {
        selectedDate.value = formattedDate;
        citasCount.value = 0;
        citasDetails.value = [];
    }
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const store = useStore()
const isSuperAdmin = computed(() => (store.getters.userRole == 'Superadministrador'))

onMounted(() => {
    // Esto puede ser donde cargues los datos de citas desde una API o una base de datos.
    console.log("Calendario cargado");
});

</script>

<template>
    <div>
        <div class="card grid grid-cols-12 gap-1 lg:gap-y-6 xl:gap-4">

            <div class="col-span-12 md:col-span-8 lg:col-span-12 lg:order-2 xl:col-span-9 xl:order-none">
                <div class="flex items-center mb-0">
                    <span class="block text-2xl font-bold text-secondary">Calendario de Citas</span>
                </div>
                <!-- Card que contiene el DatePicker -->
                <div class="card flex justify-center mb-0">
                    <DatePicker v-model="selectedDate" inline class="w-full sm:w-[50rem]" :dates="citasDates"
                        @day-click="handleDateClick" :locale="spanishLocale" />
                </div>

                <IngresosEgresosWidget />

            </div>


            <div
                class="col-span-12 md:col-span-4 lg:col-span-12 lg:order-1 lg:flex lg:overflow-auto lg:gap-5 xl:col-span-3 xl:block">
                <!--Sedes-->
                <router-link v-if="isSuperAdmin" to="/mantenimiento/sedes/todas">
                    <Card class="mb-1">
                        <template #content>
                            <div class="flex items-center mb-0">
                                <div class="col-span-4 flex items-center justify-center bg-primary-50 dark:bg-primary-400/20 rounded-border"
                                    style="width: 3.5rem; height: 3.5rem">
                                    <i class="pi pi-fw pi-building text-primary-500 dark:text-white/90 !text-4xl"></i>
                                </div>
                                <div class="col-span-8 flex justify-center flex-col pl-4">
                                    <span class="block text-lg font-bold">Sedes</span>
                                    <span class="block text-2xl font-bold text-primary dark:text-white/90">05</span>
                                </div>
                            </div>
                        </template>
                    </Card>
                </router-link>
                <!--Citas-->
                <router-link to="/gestion/citas/todas">
                    <Card class="mb-1">
                        <template #content>
                            <div class="flex items-center mb-0">
                                <div class="col-span-4 flex items-center justify-center bg-secondary-50 dark:bg-secondary-400/20 rounded-border"
                                    style="width: 3.5rem; height: 3.5rem">
                                    <i
                                        class="pi pi-fw pi-calendar-clock text-secondary-500 dark:text-white/90 !text-4xl"></i>
                                </div>
                                <div class="col-span-8 flex justify-center flex-col pl-4">
                                    <span class="block text-lg font-bold">Citas</span>
                                    <span class="block text-2xl font-bold text-secondary dark:text-white/90">11</span>
                                </div>
                            </div>
                        </template>
                    </Card>
                </router-link>
                <!--Quiroprácticos-->
                <Card class="mb-1">
                    <template #content>
                        <div class="flex items-center mb-0">
                            <div class="col-span-4 flex items-center justify-center bg-primary-50 dark:bg-primary-400/20 rounded-border"
                                style="width: 3.5rem; height: 3.5rem">
                                <span
                                    class="material-symbols-outlined text-primary dark:text-white/90 !text-5xl">medical_information</span>
                            </div>
                            <div class="col-span-8 flex justify-center flex-col pl-4">
                                <span class="block text-lg font-bold">Quiroprácticos</span>
                                <span class="block text-2xl font-bold text-primary dark:text-white/90">23</span>
                            </div>
                        </div>
                    </template>
                </Card>
                <!--Pacientes-->
                <Card class="mb-1">
                    <template #content>
                        <div class="flex items-center mb-0">
                            <div class="col-span-4 flex items-center justify-center bg-secondary-50 dark:bg-secondary-400/20 rounded-border"
                                style="width: 3.5rem; height: 3.5rem">
                                <i class="pi pi-fw pi-user-plus text-secondary dark:text-white/90 !text-5xl"></i>
                            </div>
                            <div class="col-span-8 flex justify-center flex-col pl-4">
                                <span class="block text-lg font-bold">Pacientes</span>
                                <span class="block text-2xl font-bold text-secondary dark:text-white/90">190</span>
                            </div>
                        </div>
                    </template>
                </Card>
                <!--Pagos-->
                <Card class="mb-1">
                    <template #content>
                        <div class="flex items-center mb-0">
                            <div class="col-span-4 flex items-center justify-center bg-primary-50 dark:bg-primary-400/20 rounded-border"
                                style="width: 3.5rem; height: 3.5rem">
                                <i class="pi pi pi-money-bill text-primary dark:text-white/90 !text-5xl"></i>
                            </div>
                            <div class="col-span-8 flex justify-center flex-col pl-4">
                                <span class="block text-lg font-bold">Pagos</span>
                                <span class="block text-2xl font-bold text-primary dark:text-white/90">23</span>
                            </div>
                        </div>
                    </template>
                </Card>
                <!--Recetas-->
                <Card class="mb-1">
                    <template #content>
                        <div class="flex items-center mb-0">
                            <div class="col-span-4 flex items-center justify-center bg-secondary-50 dark:bg-secondary-400/20 rounded-border"
                                style="width: 3.5rem; height: 3.5rem">
                                <i class="pi pi-fw pi pi-file text-secondary dark:text-white/90 !text-5xl"></i>
                            </div>
                            <div class="col-span-8 flex justify-center flex-col pl-4">
                                <span class="block text-lg font-bold">Reportes</span>
                                <span class="block text-2xl font-bold text-secondary dark:text-white/90">11</span>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!--
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <RecentSalesWidget />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
    -->
    </div>
</template>
