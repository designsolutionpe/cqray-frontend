<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Principal',
        items: [{ label: 'Tablero', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Gestion Clínica',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Agendamientos de Citas',
                icon: 'material-symbols-outlined clinical_notes',
                items: [
                    { label: 'Todas las citas' , to: '/gestion/cita' },
                    { label: 'Añadir citas' , to: '#' },
                    { label: 'Calendario de citas' , to: '#' },
                ]
            },
            {
                label: 'Integrador Whatsapp',
                icon: 'pi pi-fw pi-whatsapp',
                to: '/gestion/integrador'
            },
            {
                label: 'Quiroprácticos',
                icon: 'material-symbols-outlined medical_information',
                items:[
                    { label: 'Todos los quiroprácticos' , to: '/gestion/quiropractico' },
                    { label: 'Añadir quiroprácticos' , to: '#' },
                    { label: 'Historial atendidos' , to: '#' },
                ]
            },
            {
                label: 'Pacientes',
                icon: 'pi pi-fw pi-user-plus',
                to: '/gestion/paciente',
                items: [
                    { label: 'Todos los pacientes' , to: '/gestion/paciente' },
                    { label: 'Añadir pacientes' , to: '#' },
                    { label: 'Historial de pagos' , to: '#' },
                    { label: 'Historias clínicas' , to: '#' },
                ]
            },
        ]
    },
    {
        label: 'Mantenimiento',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Control de sedes',
                icon: 'pi pi-fw pi-building',
                to: '/mantenimiento/sede',
                items: [
                    { label: 'Todos los sedes' , to: '/mantenimiento/sede' },
                    { label: 'Añadir sede' , to: '#' },
                ]
            },
            {
                label: 'Control de usuario',
                icon: 'pi pi-fw pi-users',
                to: '/mantenimiento/usuario',
                items: [
                    { label: 'Todos los usuarios' , to: '/mantenimiento/usuario' },
                    { label: 'Añadir usuario' , to: '#' },
                    { label: 'Añadir Call Center' , to: '#' },
                ]
            },
            {
                label: 'Control método de pagos',
                icon: 'pi pi-fw pi-credit-card',
                to: '/mantenimiento/',
                items: [
                    { label: 'Todos los métodos de pago' , to: '#' },
                    { label: 'Añadir métodos de pago' , to: '#' },
                ]
            },
            {
                label: 'Horarios quiroprácticos',
                icon: 'pi pi-fw pi-calendar-plus',
                to: '/mantenimiento/horario',
                items: [
                    { label: 'Todos los horarios' , to: '/mantenimiento/horario' },
                    { label: 'Añadir horario' , to: '#' },
                ]
            },
            {
                label: 'Categorías',
                icon: 'pi pi-fw pi-list',
                to: '/mantenimiento/',
                items: [
                    { label: 'Todas las categorías' , to: '#' },
                    { label: 'Añadir categorías' , to: '#' },
                ]
            },
            {
                label: 'Compras',
                icon: 'pi pi-fw pi-shopping-cart',
                to: '/mantenimiento/',
                items: [
                    { label: 'Registrar proveedor' , to: '#' },
                    { label: 'Ingresar compra' , to: '#' },
                    { label: 'Ver lista de compras' , to: '#' },
                ]
            },
            {
                label: 'Artículos',
                icon: 'pi pi-fw pi-file',
                to: '/mantenimiento/',
                items: [
                    { label: 'Agregar producto' , to: '#' },
                    { label: 'Agregar servicio' , to: '#' },
                ]
            },
        ]
    },
    {
        label: 'Gestión Ventas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Realizar Ventas',
                icon: 'pi pi-fw pi-dollar',
                items: [
                    { label: 'Boleta' , to: '/gestion/venta' },
                    { label: 'Factura' , to: '#' },
                    { label: 'Nota de crédito' , to: '#' },
                ]
            },
            {
                label: 'Comprobantes',
                icon: 'pi pi-fw pi-receipt',
                items: [
                    { label: 'Consultar comprobante' , to: '/gestion/comprobante' },
                    { label: 'Factura y boleta anulados' , to: '#' },
                    { label: 'Enviar resumen de boletas' , to: '#' },
                    { label: 'Validar facturas' , to: '#' },
                    { label: 'Validar boletas' , to: '#' },
                ]
            },
            {
                label: 'Anular comprobantes',
                icon: 'pi pi-fw pi-times-circle',
                items: [
                    { label: 'Baja facturas' , to: '#' },
                    { label: 'Baja boletas' , to: '#' },
                    { label: 'Baja nota de crédito' , to: '#' },
                ]
            },
        ]
    },
    {
        label: 'Gestión e Inventario',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Caja',
                icon: 'pi pi-fw pi-money-bill',
                to: '/',
                items: [
                    { label: 'Caja chica' , to: '#' },
                    { label: 'Gastos / Ingresos' , to: '#' },
                    { label: 'Ingreso diario' , to: '#' },
                    { label: 'Utilidad semanal' , to: '#' },
                    { label: 'Balance de ganancias' , to: '#' },
                ]
            },
            {
                label: 'Administración',
                icon: 'pi pi-fw pi-address-book',
                to: '/',
                items: [
                    { label: 'Registro de inventario' , to: '#' },
                ]
            },
            {
                label: 'Movimiento',
                icon: 'pi pi-fw pi-arrow-right-arrow-left',
                to: '/',
                items: [
                    { label: 'Kardex por artículo' , to: '#' },
                ]
            },
            {
                label: 'Planilla personal',
                icon: 'pi pi-fw pi-sitemap',
                to: '/',
                items: [
                    { label: 'Empleados' , to: '#' },
                    { label: 'Tipo de seguro' , to: '#' },
                    { label: 'Boleta de pago' , to: '#'},
                ]
            },
        ]
    },
    {
        label: 'Reportes Generales',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Ventas agrupadas',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Venta día / mes',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Ventas por paciente',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Ventas por administrador',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reporte inventario valorizado',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Generar PLE',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes de compras',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Margen ganancias',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
        ]
    },

    /*
    {
        label: 'UI Components',
        items: [
            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
            { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
            { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
            { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
            { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
            { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
            { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
            { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
            { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
            { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
            { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline' },
            { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
        ]
    },
    
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
                to: '/landing'
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },
            {
                label: 'Crud',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/crud'
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '#'
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/empty'
            }
        ]
    },
    {
        label: 'Hierarchy',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/documentation'
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/primefaces/sakai-vue',
                target: '_blank'
            }
        ]
    }
    */
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
