<script setup>
import { loginUser } from '@/service/sesion/LoginService';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const login = ref('');
const password = ref('');
const isLoading = ref(false)
const checked = ref(false);
const store = useStore();
const router = useRouter();
const toast = useToast();

const loginUserHandler = async () => {
  try {
    isLoading.value = true
    const response = await loginUser({
      login: login.value,
      password: password.value,
    });

    // Aquí se espera que el backend devuelva algo como un token de acceso
    if (response && response.token) {
      // Genera el dia de hoy para funcionalidad de caja chica

      const { tipo } = response.data.caja_last_item || { tipo: 'Terminal' }

      const d = new Date().toDateString()
      const currentCajaDate = new Date(d).getTime()

      const cajaChicaData = {
        is_opened: (tipo != 'Terminal'),
        current_balance: null,
        current_date: currentCajaDate,
        last_record: response.data.caja_last_item
      }

      store.dispatch('setCajaChicaData', cajaChicaData)

      const { user } = response.data

      // Guarda datos usuario
      store.dispatch('login', {
        isAuthenticated: true,
        id: user.id,
        id_sede: user.id_sede,
        userRole: user.role.nombre,
        token: response.token,
        nombre: user.persona.nombre,
        apellido: user.persona.apellido,
        foto: `${import.meta.env.VITE_BASE_URL}/api/images/${user.persona.foto}`
      });
      isLoading.value = false
      router.push({ name: 'dashboard' });
    } else {
      console.error('Respuesta inválida del backend');
    }
  } catch (error) {
    console.error('Login fallido:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Credenciales incorrectas', life: 3000 });
  }
  isLoading.value = false
};

</script>

<template>

  <div class="fondo-ondas min-h-screen flex flex-col items-center justify-center">
    <Toast />
    <!-- Logo y título -->
    <div class="text-center mb-6">
      <img src="/logo_ray2.png" alt="Logo" class="w-1/2 mx-auto mb-4" />
      <h1 class="text-3xl font-bold text-white">
        Iniciar sesión
      </h1>
    </div>

    <!-- Tarjeta/formulario -->
    <div class="bg-white/90 rounded-lg p-6 w-full max-w-sm shadow-lg">
      <!-- Campo de usuario -->
      <label for="login1" class="block text-gray-800 font-semibold mb-1">
        Usuario
      </label>
      <InputGroup class="mb-4">
        <InputGroupAddon>
          <i class="pi pi-user"></i>
        </InputGroupAddon>
        <InputText id="login1" v-model="login" type="text" placeholder="Ingrese su usuario o correo"
          :disabled="isLoading" class="w-full" required />
      </InputGroup>

      <!-- Campo de contraseña -->
      <label for="password1" class="block text-gray-800 font-semibold mb-1">
        Contraseña
      </label>
      <InputGroup class="mb-4">
        <InputGroupAddon>
          <i class="pi pi-lock"></i>
        </InputGroupAddon>
        <Password id="password1" v-model="password" placeholder="Ingrese su contraseña" required :disabled="isLoading"
          :toggleMask="!isLoading" :feedback="false" class="w-full" />
      </InputGroup>

      <!-- Recordarme y botón -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <Checkbox v-model="checked" id="rememberme1" binary :disabled="isLoading" />
          <label for="rememberme1" class="text-gray-700">
            Recordarme
          </label>
        </div>
      </div>
      <Button label="Ingresar" class="w-full bg-primary" @click="loginUserHandler" :loading="isLoading" />
    </div>

    <div class="mt-6 text-center text-white">
      <p class="text-lg font-bold">SISTEMA ERP TOTAL</p>
      <p>Gestión de centros quiroprácticos</p>
    </div>
  </div>

</template>

<style scoped>
.pi-eye,
.pi-eye-slash {
  transform: scale(1.4);
  margin-right: 0.75rem;
}

.fondo-ondas {
  background-image: url('@/assets/gradient_2.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  /* o 'contain', depende de tu necesidad */
  background-position: center;
}
</style>