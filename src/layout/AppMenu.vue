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
        label: 'Gestión Clínica',
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
                url: 'https://integrador.unichat.space',
                target: '_blank'
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
                    { label: 'Todos los usuarios', to: '/mantenimiento/usuarios' },
                    { label: 'Añadir usuario', to: '/mantenimiento/usuarios/agregar' },
                ]
            },
            {
                label: 'Control roles',
                icon: 'pi pi-fw pi-tag',
                items: [
                    { label: 'Todos los roles', to: '/mantenimiento/roles' },
                    { label: 'Añadir rol', to: '/mantenimiento/roles/agregar' },
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
                    { label: 'Todas las compras', to: '#' },
                    { label: 'Ingresar compra', to: '#' },
                    { label: 'Registrar proveedor', to: '#' },
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
                    { label: 'Constancia de Pago', to: '/gestion/ventas/constanciapago' },
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
                    { label: 'Caja chica', to: '/inventario/caja-chica' },
                    { label: 'Ingresos', to: '#' },
                    { label: 'Egresos', to: '#' },
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

const roleFiltering = ref({
    'Desarrollador': true,
    'Superadministrador': {
        'Principal': true,
        'Gestión Clínica': {
            'Agendamientos de Citas': true,
            'Integrador Whatsapp': true,
            'Pacientes': true
        },
        'Mantenimiento': {
            'Control sedes': true,
            'Control usuarios': {
                'Todos los usuarios': true
            },
            'Control roles': {
                'Todos los roles': true
            },
            'Categorías': true,
            'Unidad de Medida': true,
            'Artículos': true
        },
        'Gestión Ventas': {
            'Realizar Ventas': true,
        },
        'Gestión e Inventario': {
            'Caja': true
        }
    },
    'Administrador': {
        'Principal': true,
        'Gestión Clínica': {
            'Agendamientos de Citas': true,
            'Integrador Whatsapp': true,
            'Pacientes': true
        },
        'Mantenimiento': {
            'Artículos': true,
        },
        'Gestión Ventas': {
            'Realizar Ventas': true
        }
    },
    'Contador': {
        'Principal': true
    },
    'CallCenter': {
        'Principal': true
    },
    'Paciente': {
        'Principal': true
    }
});

const updateMenu = () => {
    // Inicializamos el menú vacío
    filteredMenu.value = [];

    // Verifica que el rol exista
    if (Object.keys(roleFiltering.value).includes(userRole.value)) {
        const role = roleFiltering.value[userRole.value]

        if (typeof role == 'undefined') return

        // Si el rol es TRUE mostrar todo
        if (typeof role == 'boolean' && role)
            return filteredMenu.value = menuItems.value
        else if (typeof role == 'boolean' && !role)
            return

        // Si el rol tiene modulos por activar
        filteredMenu.value = menuItems.value.map(item => {
            const module_name = item.label

            if (typeof role[module_name] == 'undefined') return

            // Verifica si el modulo debe ser totalmente activo
            if (typeof role[module_name] == 'boolean' && role[module_name]) return item
            else if (typeof role[module_name] == 'boolean' && !role[module_name]) return

            // Verifica los submodulos
            item.items = item.items.map(subitem => {
                const submodule_name = subitem.label

                if (Object.keys(role[module_name]).includes(submodule_name)) {
                    const submodule_obj = role[module_name][submodule_name]

                    console.log('submodule', submodule_obj)

                    if (typeof submodule_obj == 'boolean' && submodule_obj) return subitem
                    else if (typeof submodule_obj == 'boolean' && !submodule_obj) return

                    if (Array.isArray(Object.keys(submodule_obj)))
                        subitem.items = subitem.items.filter(nanoitem => Object.keys(submodule_obj).includes(nanoitem.label) && submodule_obj[nanoitem.label])

                    return subitem
                }

            }).filter(e => e)

            return item

        }).filter(e => e)

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
