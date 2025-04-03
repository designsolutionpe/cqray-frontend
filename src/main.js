import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import { definePreset } from '@primeuix/themes';

const app = createApp(App);

const CustomPreset = definePreset(Aura,{
    semantic: {
        primary: {
            // Color primario y sus tonos
            50: '#b0b4e1',
            100: '#9a9fd4',
            200: '#858cd1',
            300: '#6f78cd',
            400: '#5b66c9',
            500: '#2D2E93', // Base del color primario
            600: '#2a2a7c',
            700: '#242467',
            800: '#1f1f52',
            900: '#1a1a3d',
        },
    }
})

app.use(router);
app.use(store);
app.use(PrimeVue, {
    theme: {
        preset: CustomPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
