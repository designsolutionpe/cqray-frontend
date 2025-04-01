<script setup>
import { useToast } from 'primevue/usetoast';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { onMounted, ref } from 'vue';


const sedes = ref([]);

const perfil = ref({
  nombre: '',
  apellidos: '',
  email: '',
  clave: '',
  sede: null,
  foto: null
})

const toast = useToast();
const selectedFile = ref(null);
const previewSrc = ref(null);
const dt = ref();
const submitted = ref(false);

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

}

function removeImage() {

}

async function savePerfil(){

}

onMounted(() => {
    cargarSedes();
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
                        <InputText id="nombre" v-model.trim="perfil.nombre" fluid placeholder="Ingresa nombres" />
                    </div>

                    <!-- Apellidos -->
                    <div class="col-span-6">
                        <label for="apellidos" class="block font-bold mb-2">Apellidos</label>
                        <InputText id="apellidos" v-model.trim="perfil.apellidos" fluid placeholder="Ingresa apellidos" />
                    </div>

                    <!-- Login (Email) -->
                    <div class="col-span-6">
                        <label for="email" class="block font-bold mb-2">Correo</label>
                        <InputText id="email" v-model.trim="perfil.email" type="email" fluid placeholder="Ingresa correo" />
                    </div>

                    <!-- Clave -->
                    <div class="col-span-6">
                        <label for="clave" class="block font-bold mb-2">Contraseña</label>
                        <Password id="clave" v-model="perfil.clave" toggleMask fluid placeholder="Ingresa contraseña" />
                    </div>

                    <!-- Sede -->
                    <div class="col-span-6">
                        <label for="sede" class="block font-bold mb-2">Sede</label>
                        <Select id="sede" v-model="perfil.sede" :options="sedes" optionLabel="label" optionValue="value" placeholder="Selecciona una sede" fluid />
                    </div>

                    <!-- Imagen -->
                    <div class="col-span-6">
                      <label for="imagen" class="block font-bold mb-2">Foto</label>
                      <div class="flex flex-col gap-3 items-start">
                        <FileUpload mode="basic" name="foto" accept="image/*" chooseLabel="Subir imagen"
                          :maxFileSize="1000000" @select="onFileSelect" customUpload auto class="p-button-primary" />
                        <div v-if="previewSrc" class="relative flex items-center">
                          <img :src="previewSrc" alt="Imagen" class="w-32 h-32 rounded-lg shadow" />
                          <Button icon="pi pi-trash" class="ml-2 p-button-rounded p-button-danger p-button-sm" @click="removeImage" />
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