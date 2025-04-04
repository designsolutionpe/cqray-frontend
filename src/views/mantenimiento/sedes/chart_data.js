const documentStyle = getComputedStyle(document.documentElement);
const borderColor = documentStyle.getPropertyValue('--surface-border');
const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');
const titleColor = documentStyle.getPropertyValue('--secondary-color');

export const charts = {
  datasets: {
    paquetes: [
      {
        type: 'line',
        tension: 0.3,
        borderWidth: 3,
        label: 'Paq. Completo',
        borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'line',
        tension: 0.3,
        borderWidth: 3,
        label: 'Paq. Incompleto',
        borderColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'line',
        tension: 0.3,
        borderWidth: 3,
        label: 'Paq. Mantenimiento',
        borderColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'line',
        tension: 0.3,
        borderWidth: 3,
        label: 'Paq. por Sesiones',
        borderColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
    ],
    quiropracticos: [
      {
        type: 'bar',
        tension: 0.3,
        label: 'Paq. Completo',
        borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Paq. Incompleto',
        borderColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--secondary-color'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Paq. Mantenimiento',
        borderColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-slate-950'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Paq. por Sesiones',
        borderColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
    ],
    pacientes: [{
      type: 'bar',
      tension: 0.3,
      label: 'Nuevos pacientes',
      backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
      data: [], // Datos de ingresos,
    }],
    pagos: [
      {
        type: 'bar',
        tension: 0.3,
        label: 'Transferencia bancarias',
        borderColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--primary-color'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Pago efectivo',
        borderColor: documentStyle.getPropertyValue('--p-green-400'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-green-400'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Plin',
        borderColor: documentStyle.getPropertyValue('--p-sky-500'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-sky-500'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
      {
        type: 'bar',
        tension: 0.3,
        label: 'Yape',
        borderColor: documentStyle.getPropertyValue('--p-violet-700'), // Color para ingresos
        backgroundColor: documentStyle.getPropertyValue('--p-violet-700'), // Color para ingresos
        data: [], // Datos de ingresos,
      },
    ],
  },
  options: {
    paquetes: {
      plugins: { title: { display: true, text: "Todas las sedes", color: titleColor } },
      maintainAspectRatio: false,
      aspectRatio: 1,
      indexAxis: 'x',
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          },
        },
        y: {
          stacked: false,
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          },
          ticks: {
            backdropPadding: { x: 100 }
          }
        }
      }
    },
    quiropracticos: {
      plugins: { title: { display: true, text: "Todas las sedes", color: titleColor } },
      maintainAspectRatio: false,
      aspectRatio: 1,
      indexAxis: 'y',
      scales: {
        x: {
          stacked: false,
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          }
        },
        y: {
          stacked: true,
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          }
        }
      }
    },
    pacientes: {
      plugins: { title: { display: true, text: "Todas las sedes", color: titleColor } },
      maintainAspectRatio: false,
      aspectRatio: 1,
      indexAxis: 'x',
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          },
        },
        y: {
          stacked: false,
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          },
          ticks: {
            backdropPadding: { x: 100 }
          }
        }
      }
    },
    pagos: {
      plugins: { title: { display: true, text: "Todas las sedes", color: titleColor } },
      maintainAspectRatio: false,
      aspectRatio: 1,
      indexAxis: 'x',
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          },
        },
        y: {
          stacked: false,
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          },
          ticks: {
            backdropPadding: { x: 100 }
          }
        }
      }
    },
  },
}