<script setup>

import PreloaderSVG from '@/assets/preloader.svg';
import { useLayout } from '@/layout/composables/layout';

const props = defineProps({
  isTransparent: {
    type: Boolean,
    required: false,
    default: false
  }
})

const { isDarkTheme } = useLayout()
</script>
<template>
  <div class="absolute top-0 left-0 w-full h-full z-10">
    <div class="absolute top-0 left-0 w-full h-full"
      :class="{ 'bg-white/75': !props.isTransparent && !isDarkTheme, 'bg-black/75': !props.isTransparent && isDarkTheme }">
    </div>
    <img class="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :src="PreloaderSVG" alt="Cargando...">
  </div>
</template>
<style scoped></style>