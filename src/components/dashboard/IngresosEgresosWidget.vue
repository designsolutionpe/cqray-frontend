<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);

const labels = ref([])
const ingresos = ref([])
const egresos = ref([])
const totales = ref([])

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: labels.value, // Meses
        datasets: [
            {
                type: 'bar',
                label: 'Ingresos',
                backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
                data: ingresos.value, // Datos de ingresos
                barThickness: 32
            },
            {
                type: 'bar',
                label: 'Egresos',
                backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para egresos
                data: egresos.value, // Datos de egresos (valores negativos)
                barThickness: 32
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

</script>

<template>
    <div>
        <div class="block text-2xl font-bold text-secondary">Ingresos y egresos por sede</div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>