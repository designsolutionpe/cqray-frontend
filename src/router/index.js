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
                    path: '/gestion/ventas/notacredito',
                    name: 'notacredito',
                    component: () => import('@/views/gestion/ventas/NotaCredito.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador', 'Administrador'] }
                },
                // {
                //     path: '/mantenimiento/sede',
                //     name: 'sede',
                //     component: () => import('@/views/mantenimiento/Sede.vue'),
                //     meta : { requiresAuth: true}
                // },
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
                /*
                {
                    path: '/mantenimiento/horario',
                    name: 'horario',
                    component: () => import('@/views/mantenimiento/Horario.vue'),
                    meta: { requiresAuth: true, roles: ['Superadministrador'] }
                },
                */
                // {
                //     path: '/uikit/formlayout',
                //     name: 'formlayout',
                //     component: () => import('@/views/uikit/FormLayout.vue')
                // },
                // {
                //     path: '/uikit/input',
                //     name: 'input',
                //     component: () => import('@/views/uikit/InputDoc.vue')
                // },
                // {
                //     path: '/uikit/button',
                //     name: 'button',
                //     component: () => import('@/views/uikit/ButtonDoc.vue')
                // },
                // {
                //     path: '/uikit/table',
                //     name: 'table',
                //     component: () => import('@/views/uikit/TableDoc.vue')
                // },
                // {
                //     path: '/uikit/list',
                //     name: 'list',
                //     component: () => import('@/views/uikit/ListDoc.vue')
                // },
                // {
                //     path: '/uikit/tree',
                //     name: 'tree',
                //     component: () => import('@/views/uikit/TreeDoc.vue')
                // },
                // {
                //     path: '/uikit/panel',
                //     name: 'panel',
                //     component: () => import('@/views/uikit/PanelsDoc.vue')
                // },

                // {
                //     path: '/uikit/overlay',
                //     name: 'overlay',
                //     component: () => import('@/views/uikit/OverlayDoc.vue')
                // },
                // {
                //     path: '/uikit/media',
                //     name: 'media',
                //     component: () => import('@/views/uikit/MediaDoc.vue')
                // },
                // {
                //     path: '/uikit/message',
                //     name: 'message',
                //     component: () => import('@/views/uikit/MessagesDoc.vue')
                // },
                // {
                //     path: '/uikit/file',
                //     name: 'file',
                //     component: () => import('@/views/uikit/FileDoc.vue')
                // },
                // {
                //     path: '/uikit/menu',
                //     name: 'menu',
                //     component: () => import('@/views/uikit/MenuDoc.vue')
                // },
                // {
                //     path: '/uikit/charts',
                //     name: 'charts',
                //     component: () => import('@/views/uikit/ChartDoc.vue')
                // },
                // {
                //     path: '/uikit/misc',
                //     name: 'misc',
                //     component: () => import('@/views/uikit/MiscDoc.vue')
                // },
                // {
                //     path: '/uikit/timeline',
                //     name: 'timeline',
                //     component: () => import('@/views/uikit/TimelineDoc.vue')
                // },
                // {
                //     path: '/pages/empty',
                //     name: 'empty',
                //     component: () => import('@/views/pages/Empty.vue')
                // },
                // {
                //     path: '/pages/crud',
                //     name: 'crud',
                //     component: () => import('@/views/pages/Crud.vue')
                // },
                // {
                //     path: '/documentation',
                //     name: 'documentation',
                //     component: () => import('@/views/pages/Documentation.vue')
                // }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
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
    // Verificar si la ruta requiere un rol específico
    else if (to.meta.roles && !to.meta.roles.includes(store.getters.userRole)) {
        next({ name: 'accessDenied' });  // Si el rol no coincide, redirigir a acceso denegado
    }
    else {
        next();  // Permitir la navegación si todo está bien
    }
});


export default router;
