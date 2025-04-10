<script setup>
import Preloader from '@/components/Preloader.vue';
import { ref } from 'vue';

const isPageLoading = ref(false)

</script>
<template>
  <div class="card relative overflow-hidden">
    <Preloader v-if="isPageLoading"></Preloader>
    <div class="flex gap-3">
      <div class="flex flex-col gap-4 justify-end">
        <div class="flex flex-col gap-4">
          <p class="text-2xl font-bold text-secondary m-0">Directorio</p>
          <router-link to="/gestion/citas/agregar">
            <Button icon="pi pi-plus" label="Agregar cita"></Button>
          </router-link>
          <router-link to="/gestion/pacientes/agregar">
            <Button icon="pi pi-plus" label="Agregar paciente"></Button>
          </router-link>
        </div>
        <div class="card shadow">
          <p class="text-xl font-bold">ID:</p>
        </div>
      </div>

    </div>
  </div>
</template>