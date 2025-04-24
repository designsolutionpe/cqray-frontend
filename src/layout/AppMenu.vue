<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import AppMenuItem from './AppMenuItem.vue';

const store = useStore();
const userRole = computed(() => store.getters.userRole);

const menuItems = ref([
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
                    { label: 'Todas las citas', to: '/gestion/citas/todas' },
                    { label: 'Añadir citas', to: '/gestion/citas/agregar' },
                    { label: 'Calendario de citas', to: '/gestion/citas/calendario' },
                ]
            },
            {
                label: 'Integrador Whatsapp',
                icon: 'pi pi-fw pi-whatsapp',
                to: '#'
            },
            {
                label: 'Quiroprácticos',
                icon: 'material-symbols-outlined medical_information',
                items: [
                    { label: 'Todos los quiroprácticos', to: '/gestion/quiropracticos/todos' },
                    { label: 'Añadir quiroprácticos', to: '/gestion/quiropracticos/agregar' },
                    { label: 'Historial atendidos', to: '#' },
                ]
            },
            {
                label: 'Pacientes',
                icon: 'pi pi-fw pi-user-plus',
                items: [
                    { label: 'Todos los pacientes', to: '/gestion/pacientes/todos' },
                    { label: 'Añadir pacientes', to: '/gestion/pacientes/agregar' },
                    { label: 'Historial de pagos', to: '/gestion/pacientes/historial-pagos' },
                    { label: 'Historias clínicas', to: '/gestion/pacientes/historial-clinico' },
                ]
            },
        ]
    },
    {
        label: 'Mantenimiento',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Control sedes',
                icon: 'pi pi-fw pi-building',
                items: [
                    { label: 'Todos los sedes', to: '/mantenimiento/sedes/todas' },
                    { label: 'Añadir sede', to: '/mantenimiento/sedes/agregar' },
                ]
            },
            {
                label: 'Control usuarios',
                icon: 'pi pi-fw pi-users',
                items: [
                    { label: 'Todos los usuarios', to: '/mantenimiento/usuario' },
                    { label: 'Añadir usuario', to: '#' },
                ]
            },
            {
                label: 'Control personal',
                icon: 'pi pi-fw pi-users',
                items: [
                    { label: 'Todo el personal', to: '/mantenimiento/personas/todas' },
                    { label: 'Añadir personal', to: '/mantenimiento/personas/agregar' },
                ]
            },
            /*
            {
                label: 'Horario',
                icon: 'pi pi-calendar-plus',
                to: '/mantenimiento/horario'
            },
            */
            {
                label: 'Control pacientes',
                icon: 'pi pi-fw pi-plus-circle',
                items: [
                    { label: 'Todos los planes', to: '#' },
                    { label: 'Todos los diagnosticos', to: '#' },
                    { label: 'Todos los documentos', to: '#' },
                ]
            },
            // {
            //     label: 'Control quiroprácticos',
            //     icon: 'pi pi-fw pi-calendar-plus',
            //     items: [
            //         { label: 'Configuración de resultados', to: '#' },
            //         { label: 'Configuración firma de anexo', to: '#' },
            //         { label: 'Configuración de horarios', to: '#' },
            //     ]
            // },
            {
                label: 'Categorías',
                icon: 'pi pi-fw pi-list',
                items: [
                    { label: 'Todas las categorías', to: '/mantenimiento/categorias/todas' },
                    { label: 'Añadir categorías', to: '/mantenimiento/categorias/agregar' },
                ]
            },
            {
                label: 'Unidad de Medida',
                icon: 'pi pi-fw pi-hashtag',
                items: [
                    { label: 'Todas las unidades', to: '/mantenimiento/unidad-medida/todas' },
                    { label: 'Añadir unidad', to: '/mantenimiento/unidad-medida/agregar' },
                ]
            },
            {
                label: 'Compras',
                icon: 'pi pi-fw pi-shopping-cart',
                items: [
                    { label: 'Registrar proveedor', to: '#' },
                    { label: 'Ingresar compra', to: '#' },
                    { label: 'Ver lista de compras', to: '#' },
                ]
            },
            {
                label: 'Artículos',
                icon: 'pi pi-fw pi-file',
                items: [
                    { label: 'Agregar producto', to: '/mantenimiento/articulos/producto' },
                    { label: 'Agregar servicio', to: '/mantenimiento/articulos/servicio' },
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
                    { label: 'Boleta', to: '/gestion/ventas/boleta' },
                    { label: 'Factura', to: '/gestion/ventas/factura' },
                    { label: 'Nota de crédito', to: '/gestion/ventas/notacredito' },
                ]
            },
            {
                label: 'Comprobantes',
                icon: 'pi pi-fw pi-receipt',
                items: [
                    { label: 'Consultar comprobante', to: '#' },
                    { label: 'Factura y boleta anulados', to: '#' },
                    { label: 'Enviar resumen de boletas', to: '#' },
                    { label: 'Validar facturas', to: '#' },
                    { label: 'Validar boletas', to: '#' },
                ]
            },
            {
                label: 'Anular comprobantes',
                icon: 'pi pi-fw pi-times-circle',
                items: [
                    { label: 'Baja facturas', to: '#' },
                    { label: 'Baja boletas', to: '#' },
                    { label: 'Baja nota de crédito', to: '#' },
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
                items: [
                    { label: 'Caja chica', to: '#' },
                    { label: 'Gastos / Ingresos', to: '#' },
                    { label: 'Ingreso diario', to: '#' },
                    { label: 'Utilidad semanal', to: '#' },
                    { label: 'Balance de ganancias', to: '#' },
                ]
            },
            {
                label: 'Administración',
                icon: 'pi pi-fw pi-address-book',
                items: [
                    { label: 'Registro de inventario', to: '#' },
                ]
            },
            {
                label: 'Movimiento',
                icon: 'pi pi-fw pi-arrow-right-arrow-left',
                items: [
                    { label: 'Kardex por artículo', to: '#' },
                ]
            },
            {
                label: 'Planilla personal',
                icon: 'pi pi-fw pi-sitemap',
                items: [
                    { label: 'Empleados', to: '#' },
                    { label: 'Tipo de seguro', to: '#' },
                    { label: 'Boleta de pago', to: '#' },
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
                label: 'Venta día / semana / mes',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Ventas por paciente',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Ventas por administrador sede',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Margen ganancias',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes de compras',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes sedes',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes agendas',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Rep. quiropracticos',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes pacientes',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes recetas',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes historias clinicas',
                icon: 'pi pi-fw pi-chart-line',
                to: '#'
            },
            {
                label: 'Reportes usuarios',
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

const filteredMenu = ref([]);

const updateMenu = () => {
    // Inicializamos el menú vacío
    filteredMenu.value = [];

    // Verificamos si el rol es 'Superadministrador'
    if (userRole.value === 'Superadministrador') {
        filteredMenu.value = menuItems.value.map(item => {
            if (item.label === 'Gestion Clínica') {
                item.items = item.items.filter(subitem => {
                    return subitem.label !== 'Quiroprácticos'
                });
                return item;
            }
            return item;
        }).filter(item => item !== null);
    } else if (userRole.value === 'Administrador') {
        // Si el rol es 'Administrador'
        filteredMenu.value = menuItems.value.map(item => {
            if (item.label === 'Principal') {
                return item;
            }
            if (item.label === 'Gestion Clínica') {
                item.items = item.items.filter(subitem => {
                    return subitem.label === 'Agendamientos de Citas'
                        || subitem.label === 'Pacientes';
                });
                return item;
            }
            if (item.label === 'Gestión Ventas') {
                const show = ['Realizar Ventas'];
                item.items = item.items.filter(subitem => show.includes(subitem.label))
                return item
            }
            return null;
        }).filter(item => item !== null);
    } else {
        filteredMenu.value = [];
    }
};

updateMenu();

</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredMenu" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
