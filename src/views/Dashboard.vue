<script setup>
import CalendarioCitas from '@/components/dashboard/CalendarioCitas.vue';
import IngresosEgresosWidget from '@/components/dashboard/IngresosEgresosWidget.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const isSuperAdmin = computed(() => (store.getters.userRole == 'Superadministrador'))

</script>

<template>
    <div>
        <div class="card grid grid-cols-12 gap-4 lg:gap-y-6 xl:gap-4">
            <div class="col-span-12 md:col-span-8 lg:col-span-12 lg:order-2 xl:col-span-9 xl:order-none">
                <CalendarioCitas />
                <IngresosEgresosWidget />
            </div>

            <div class="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3">
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
                <!-- <router-link to="/gestion/quiropracticos/todos">
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
                </router-link> -->
                <!--Pacientes-->
                <router-link to="/gestion/pacientes/todos">
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
                </router-link>
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
                <!--Reportes-->
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
