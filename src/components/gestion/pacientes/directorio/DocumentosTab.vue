<script setup>
import PDF_TEMPLATE from '@/assets/pdf_template.png';
import { ref, watch } from 'vue';
import { formatDate } from '@/utils/Util'

const props = defineProps({
    aDocumentos: {
        type: Array,
        required: true
    }
})

const aDocumentos = ref([])

watch(
    () => props.aDocumentos,
    (docs) => {
        console.log(docs)
        aDocumentos.value = props.aDocumentos.map( d => {

            const voucher = d.voucher_url.split('/');
            const voucher_name = voucher[ voucher.length - 1 ];
            const voucher_link = d.voucher_url;

            const fecha = formatDate( d.fecha_emision );

            return { voucher_name, voucher_link, fecha };

        });
    }
)

</script>
<template>
    <!-- SI HAY DOCUMENTOS -->
    <div class="container m-auto grid grid-cols-12 gap-3 max-h-[400px] overflow-auto py-3">
        <a :href="i.voucher_link" target="_blank" v-for="i in aDocumentos" class="col-span-12 sm:col-span-4 md:col-span-3">
            <Card class="border border-grey-300">
                <template #header>
                    <img :src="PDF_TEMPLATE" alt="PDF Reference" class="w-full">
                </template>
                <template #title>
                    <div class="w-full overflow-auto">
                        <p class="m-0">{{ i.voucher_name }}</p>
                        <p class="m-0 text-gray-400 text-sm">{{ i.fecha }}</p>
                    </div>
                </template>
            </Card>
        </a>
    </div>
    <!-- SI NO HAY DOCUMENTOS -->
    <div></div>
</template>