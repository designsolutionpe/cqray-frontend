<script setup>
import Preloader from '@/components/Preloader.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { ref } from 'vue';

// GLOBAL VARIABLES
// Filters
const filters = ref()

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

initFilters()

const resetFilters = () => initFilters()

// Loading State
const isPageLoading = ref(true)


</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex flex-col gap-4">
      <p class="text-2xl font-bold text-secondary">Todas las Categorias</p>

    </div>
  </div>
</template>