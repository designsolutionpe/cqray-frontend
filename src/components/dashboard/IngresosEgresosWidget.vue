<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], // Meses
        datasets: [
            {
                type: 'bar',
                label: 'Ingresos',
                backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
                data: [10000, 12000, 13000, 15000, 12000, 14000, 13000, 16000, 11000, 15000, 17000, 19000], // Datos de ingresos
                barThickness: 32
            },
            {
                type: 'bar',
                label: 'Egresos',
                backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para egresos
                data: [-5000, -6000, -7000, -8000, -7500, -6500, -6000, -8500, -7000, -8000, -9000, -9500], // Datos de egresos (valores negativos)
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