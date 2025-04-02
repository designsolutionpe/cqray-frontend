<script setup>
import { getSedes } from '@/service/mantenimiento/SedeService';
import { getUsuarioById, updateUsuarioPersona } from '@/service/mantenimiento/UsuarioService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

const sedes = ref([]);
const store = useStore();
const id = computed(() => store.getters.id);
const isLoading = ref( true )

const perfil = ref({
    persona:{},
});
const cargarUsuario = async () => {
    try {
        isLoading.value = true
        const response = await getUsuarioById(id.value);
        isLoading.value = false
        perfil.value = response;

        if (perfil.value.persona.foto) {
            previewSrc.value = `${import.meta.env.VITE_BASE_URL}/storage/${perfil.value.persona.foto}`;
        } else {
            previewSrc.value = null;
        }

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
    }
};

const toast = useToast();
const selectedFile = ref(null);
const previewSrc = ref(null);
const dt = ref();
const submitted = ref(false);
const sanitizeValue = (value) => {
    return value && typeof value === 'string' ? value.trim() : '';
};
const sanitizeNumber = (value) => {
    return value && !isNaN(value) ? value : '';
};

const cargarSedes = async () => {
    try {
        const response = await getSedes();
        sedes.value = response.map(sede => ({
            label: sede.nombre,
            value: sede.id
        }));
    } catch (error) {
        console.error('Error al obtener las sedes:', error);
    }
};

function onFileSelect(event) {
    const file = event.files[0];

    if (file) {
        selectedFile.value = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewSrc.value = e.target.result;
        };
        reader.readAsDataURL(file);
        toast.add({ severity: 'info', summary: 'Éxito', detail: 'Foto seleccionada correctamente', life: 3000 });
    }
}

function removeImage() {
    perfil.value.persona.foto = null;
    selectedFile.value = null;
    previewSrc.value = null;
}


async function savePerfil(){
    submitted.value = true;

    // Validar los campos básicos del perfil
    if (
        !perfil.value.persona ||
        !perfil.value.persona.nombre ||
        !perfil.value.persona.apellido
    ) {
        console.error('⛔ Error: datos incompletos para actualizar el perfil.');
        return;
    }

    // Crear FormData para enviar a nuestro endpoint
    const formData = new FormData();
    
    // Campos de User (parcial)
    formData.append('login', sanitizeValue(perfil.value.login));
    formData.append('email', sanitizeValue(perfil.value.email));
    formData.append('rol', sanitizeValue(perfil.value.rol));
    formData.append('password', sanitizeValue(perfil.value.password));
    formData.append('id_sede', sanitizeNumber(perfil.value.id_sede));
    
    // Campos de Persona (parcial)
    formData.append('nombre', sanitizeValue(perfil.value.persona.nombre));
    formData.append('apellido', sanitizeValue(perfil.value.persona.apellido));
    
    // Adjuntar imagen si existe (para la foto)
    if (selectedFile.value instanceof File) {
        formData.append('foto', selectedFile.value);
    }

    try {
        if (perfil.value.id) {
            // Actualizamos usuario/persona
            const respuesta = await updateUsuarioPersona(perfil.value.id, formData);
            console.log("data actualiza",respuesta)

            const foto = respuesta.data.persona.foto

            store.dispatch('updateUserData',{
                userRole: respuesta.data.user.rol,
                nombre: respuesta.data.persona.nombre,
                apellido: respuesta.data.persona.apellido,
                foto: foto ? `${import.meta.env.VITE_BASE_URL}/storage/${foto}` : null
            })

            toast.add({ severity: 'success', summary: 'Perfil Actualizado', life: 3000 });
        }
        await cargarUsuario(); 
    } catch (error) {
        console.error('⛔ Error al guardar el perfil:', error.response?.data || error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el perfil', life: 3000 });
    }
}

onMounted(() => {
    cargarSedes();
    cargarUsuario();
});

</script>

<template>
    <div>
        <div class="card">
            <div class="flex flex-col gap-6">
                <div class="text-2xl font-bold text-primary">Administrar perfil</div>
                <div class="text-red-500 text-sm -mt-4 mb-4">Ajustes perfil</div>

                <div class="grid grid-cols-12 gap-4">
                    <!-- Nombre -->
                    <div class="col-span-6">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="perfil.persona.nombre" fluid placeholder="Ingresa nombres" />
                    </div>

                    <!-- Apellidos -->
                    <div class="col-span-6">
                        <label for="apellidos" class="block font-bold mb-2">Apellidos</label>
                        <InputText id="apellidos" v-model.trim="perfil.persona.apellido" fluid placeholder="Ingresa apellidos" />
                    </div>

                    <!-- Login (Email) -->
                    <div class="col-span-6">
                        <label for="email" class="block font-bold mb-2">Correo</label>
                        <InputText id="email" v-model.trim="perfil.email" type="email" fluid placeholder="Ingresa correo" />
                    </div>

                    <!-- Clave -->
                    <div class="col-span-6">
                        <label for="clave" class="block font-bold mb-2">Contraseña</label>
                        <Password id="clave" v-model="perfil.password" toggleMask fluid placeholder="Ingresa contraseña" />
                    </div>

                    <!-- Sede -->
                    <div class="col-span-6">
                        <label for="sede" class="block font-bold mb-2">Sede</label>
                        <Select id="sede" v-model="perfil.id_sede" :options="sedes" optionLabel="label" optionValue="value" placeholder="Selecciona una sede" fluid />
                    </div>

                    <!-- Imagen -->
                    <div class="col-span-6">
                      <label for="imagen" class="block font-bold mb-2">Foto</label>
                      <div class="flex flex-col gap-3 items-start">
                        <FileUpload mode="basic" name="foto" accept="image/*" chooseLabel="Subir imagen"
                          :maxFileSize="1000000" @select="onFileSelect" customUpload auto class="p-button-primary" />
                        <div v-if="previewSrc" class="relative flex items-center">
                          <img :src="previewSrc" alt="Imagen" class="w-42 h-42 rounded-lg shadow" />
                          <Button v-tooltip.bottom="'Eliminar'" icon="pi pi-trash" class="mr-4 p-button-rounded p-button-danger p-button-lg" @click="removeImage" />
                        </div>
                      </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-4 mt-4">
                    <Button label="Guardar" icon="pi pi-check" severity="primary" @click="savePerfil" />
                </div>
            </div>
        </div>
    </div>
</template>    