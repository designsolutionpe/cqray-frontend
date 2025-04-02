<script setup>

import PreloaderSVG from '@/assets/preloader.svg';

</script>
<template>
  <div class="flex w-100 h-100 position-absolute top-0 left-0 bg-black/20">
    <img :src="PreloaderSVG" alt="Cargando...">
  </div>
</template>
<style scoped></style>