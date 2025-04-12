<script setup>

import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  onAffirmation: {
    type: Function,
    required: true
  }
})

const bIsVisible = ref(false)

const showDialog = () => bIsVisible.value = true

const handleAffirmation = () => {
  props.onAffirmation()
  bIsVisible.value = false
}

defineExpose({
  showDialog
})

</script>

<template>
  <Dialog v-model:visible="bIsVisible" class="p-7 w-3/4 sm:w-[450px]" modal :closable="false" :draggable="false">
    <template #container>
      <p class="font-bold text-2xl mb-6 md:text-3xl text-center">{{ title }}</p>
      <div class="flex flex-col md:flex-row gap-3">
        <Button class="md:w-full" severity="primary" label="Si" icon="pi pi-check" @click="handleAffirmation"></Button>
        <Button class="md:w-full" severity="secondary" label="No" icon="pi pi-times"
          @click="bIsVisible = false"></Button>
      </div>
    </template>
  </Dialog>
</template>