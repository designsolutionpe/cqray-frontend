<script setup>
import PDF_TEMPLATE from '@/assets/pdf_template.png';
import { watch } from 'vue';

const props = defineProps({
    aDocumentos: {
        type: Array,
        required: true
    }
})

watch(
    () => props.aDocumentos,
    (docs) => console.log(docs)
)

</script>
<template>
    <!-- SI HAY DOCUMENTOS -->
    <div class="container grid-cols-4">
        <Card class="w-max">
            <template #header>
                <img :src="PDF_TEMPLATE" alt="PDF Reference" class="w-[25%]">
            </template>
            <template #title>
                <p class="pdf_title m-0">12345678912_F01_nwfpaos.pdf</p>
            </template>
        </Card>
    </div>
    <!-- SI NO HAY DOCUMENTOS -->
    <div></div>
</template>