import AppLayout from '@/layout/AppLayout.vue';
import store from '@/store';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/sesion/login',
            name: 'login',
            component: () => import('@/views/sesion/Login.vue')
        },
        {
            path: '/sesion',
            component: AppLayout,
            children: [
                {
                    path: 'perfil',
                    name: 'perfil',
                    component: () => import('@/views/sesion/Perfil.vue'),
                    meta: { requiresAuth: true }
                },
            ]
        },
        {
            path: '/mantenimiento',
            component: AppLayout,
            children: [
                {
                    path: 'pago',
                    name: 'pago',
                    component: () => import('@/views/mantenimiento/Pago.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
            ]
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                // {
                //     path: '/gestion/cita',
                //     name: 'cita',
                //     component: () => import('@/views/gestion/Cita.vue'),
                //     meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                //     //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                // },
                {
                    path: '/gestion/citas/todas',
                    name: 'citas-todas',
                    component: () => import('@/views/gestion/citas/Todas.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/citas/agregar',
                    name: 'citas-agregar',
                    component: () => import('@/views/gestion/citas/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/citas/calendario',
                    name: 'citas-calendario',
                    component: () => import('@/views/gestion/citas/Calendario.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                // {
                //     path: '/gestion/quiropractico',
                //     name: 'quiropractico',
                //     component: () => import('@/views/gestion/Quiropractico.vue'),
                //     meta: { requiresAuth: true, roles: [] }
                //     //meta: { requiresAuth: true, roles: ['admin'] },
                // },
                // {
                //     path: '/gestion/quiropracticos/todos',
                //     name: 'quiropracticos-todos',
                //     component: () => import('@/views/gestion/quiropracticos/Todos.vue'),
                //     meta: { requiresAuth: true, roles: [] }
                //     //meta: { requiresAuth: true, roles: ['admin'] },
                // },
                // {
                //     path: '/gestion/quiropracticos/agregar',
                //     name: 'quiropracticos-agregar',
                //     component: () => import('@/views/gestion/quiropracticos/Agregar.vue'),
                //     meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                //     //meta: { requiresAuth: true, roles: ['admin'] },
                // },
                // {
                //     path: '/gestion/quiropracticos/atendidos',
                //     name: 'quiropracticos-atendidos',
                //     component: () => import('@/views/gestion/quiropracticos/Atentidos.vue'),
                //     meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                //     //meta: { requiresAuth: true, roles: ['admin'] },
                // },
                // {
                //     path: '/gestion/paciente',
                //     name: 'paciente',
                //     component: () => import('@/views/gestion/Paciente.vue'),
                //     meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                //     //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                // },
                {
                    path: '/gestion/pacientes/todos',
                    name: 'paciente-todos',
                    component: () => import('@/views/gestion/pacientes/Todos.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/pacientes/agregar',
                    name: 'paciente-agregar',
                    component: () => import('@/views/gestion/pacientes/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/pacientes/directorio',
                    name: 'paciente-directorio',
                    component: () => import('@/views/gestion/pacientes/Directorio.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/pacientes/historial-pagos',
                    name: 'paciente-historial_pagos',
                    component: () => import('@/views/gestion/pacientes/HistorialPagos.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/pacientes/historial-clinico',
                    name: 'paciente-historial_clinico',
                    component: () => import('@/views/gestion/pacientes/HistorialClinico.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                    //meta: { requiresAuth: true, roles: ['admin', 'user'] },
                },
                {
                    path: '/gestion/ventas/boleta',
                    name: 'boleta',
                    component: () => import('@/views/gestion/ventas/Boleta.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/agregarboleta',
                    name: 'agregarboleta',
                    component: () => import('@/views/gestion/ventas/AgregarBoleta.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/factura',
                    name: 'factura',
                    component: () => import('@/views/gestion/ventas/Factura.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/agregarfactura',
                    name: 'agregarfactura',
                    component: () => import('@/views/gestion/ventas/AgregarFactura.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/notacredito',
                    name: 'notacredito',
                    component: () => import('@/views/gestion/ventas/NotaCredito.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/agregarnota',
                    name: 'agregarnota',
                    component: () => import('@/views/gestion/ventas/AgregarNota.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/constanciapago',
                    name: 'constanciapago',
                    component: () => import('@/views/gestion/ventas/ConstanciaPago.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/gestion/ventas/agregarconstanciapago',
                    name: 'agregarconstanciapago',
                    component: () => import('@/views/gestion/ventas/AgregarConstanciaPago.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/mantenimiento/sedes/todas',
                    name: 'sedes-todas',
                    component: () => import('@/views/mantenimiento/sedes/Todas.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/sedes/agregar',
                    name: 'sedes-agregar',
                    component: () => import('@/views/mantenimiento/sedes/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/usuario',
                    name: 'usuario',
                    component: () => import('@/views/mantenimiento/Usuario.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/usuarios',
                    name: 'usuarios-todos',
                    component: () => import('@/views/mantenimiento/usuarios/todos.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/usuarios/agregar',
                    name: 'usuarios-agregar',
                    component: () => import('@/views/mantenimiento/usuarios/agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/roles',
                    name: 'roles-todos',
                    component: () => import('@/views/mantenimiento/roles/todos.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/roles/agregar',
                    name: 'roles-agregar',
                    component: () => import('@/views/mantenimiento/roles/agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/categorias/todas',
                    name: 'categorias-todas',
                    component: () => import('@/views/mantenimiento/categorias/Todas.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/categorias/agregar',
                    name: 'categorias-agregar',
                    component: () => import('@/views/mantenimiento/categorias/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },

                {
                    path: '/mantenimiento/unidad-medida/todas',
                    name: 'unidadMedida-todas',
                    component: () => import('@/views/mantenimiento/unidad-medida/Todas.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                {
                    path: '/mantenimiento/unidad-medida/agregar',
                    name: 'unidadMedida-agregar',
                    component: () => import('@/views/mantenimiento/unidad-medida/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },

                {
                    path: '/mantenimiento/personas/todas',
                    name: 'persona-todas',
                    component: () => import('@/views/mantenimiento/personas/Todos.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },

                {
                    path: '/mantenimiento/personas/agregar',
                    name: 'persona-agregar',
                    component: () => import('@/views/mantenimiento/personas/Agregar.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },

                {
                    path: '/mantenimiento/articulos/producto',
                    name: 'articulos-producto',
                    component: () => import('@/views/mantenimiento/articulos/Producto.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },

                {
                    path: '/mantenimiento/articulos/servicio',
                    name: 'articulos-servicio',
                    component: () => import('@/views/mantenimiento/articulos/Servicio.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/inventario/caja-chica',
                    name: 'caja-chica',
                    component: () => import('@/views/gestion/inventario/caja-chica/CajaChica.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                {
                    path: '/inventario/caja-chica/ingresos',
                    name: 'caja-chica_ingresos',
                    component: () => import('@/views/gestion/inventario/caja-chica/Ingresos.vue'),
                    meta: { requiresAuth: true, roles: [] }
                },
                {
                    path: '/inventario/caja-chica/egresos',
                    name:' caja-chica_egresos',
                    component: () => import('@/views/gestion/inventario/caja-chica/Egresos.vue'),
                    meta: { requiresAuth: true, roles: [] }
                },
            ]
        },
        /*{
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },*/
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        /*
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        */
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/:pathMath(.*)*',
            name: 'checkExistence',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});


router.beforeEach((to, from, next) => {
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
        next({ name: 'login' });  // Si no está autenticado, redirigir al login
    }
    else if (store.getters.userRole == 'Desarrollador') next();
    // Verificar si la ruta requiere un rol específico
    else if (to.meta.roles && !to.meta.roles.includes(store.getters.userRole)) {
        next({ name: 'accessDenied' });  // Si el rol no coincide, redirigir a acceso denegado
    }
    else {
        console.log("rol", store.getters.userRole);
        next();  // Permitir la navegación si todo está bien
    }
});


export default router;
