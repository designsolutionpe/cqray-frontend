<script setup>
import { getUsuarios } from '@/service/mantenimiento/UsuarioService';
import { createUsuario } from '@/service/mantenimiento/UsuarioService';
import { updateUsuario } from '@/service/mantenimiento/UsuarioService';
import { deleteUsuario } from '@/service/mantenimiento/UsuarioService';
import { getSedes } from '@/service/mantenimiento/SedeService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import PersonaBusqueda from '@/components/busqueda/PersonaBusqueda.vue';

const tiposDocumento = ref([
    { label: "DNI", value: "DNI" },
    { label: "Carnet de Extranjeria", value: "Carnet de Extranjeria" },
    { label: "Pasaporte", value: "Pasaporte" },
    { label: "Otro", value: "Otro" }
]);

const generos = ref([
    { label: "Masculino", value: "Masculino" },
    { label: "Femenino", value: "Femenino" },
]);

const roles = ref([
    { label: "Superadministrador", value: "Superadministrador" },
    { label: "Administrador", value: "Administrador" },
    { label: "Doctor", value: "Doctor" },
    { label: "Paciente", value: "Paciente" },
]);

const sedes = ref([]);

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

const usuarios = ref([]);
const toast = useToast();
const selectedFile = ref(null);
const previewSrc = ref(null);
const dt = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const usuarioDialog = ref(false);
const deleteUsuarioDialog = ref(false);
const submitted = ref(false);
const usuario = ref();

const cargarUsuarios = async () => {
  try {
    const response = await getUsuarios();
    usuarios.value = response.map(u => ({
      ...u,
      persona: u.persona || { nombre: '', apellido: '', tipo_documento: '' }
    }));
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
  }
};

function openNew(){
    usuario.value = {}
    submitted.value = false;
    usuarioDialog.value = true;
}

function editUsuario(usu){
    usuario.value = { ...usu };
    usuarioDialog.value = true;
}

function confirmDeleteUsuario(usu){
    usuario.value = usu;
    deleteUsuarioDialog.value = true;
}

async function delUsuario(){

}

function hideDialog(){
    usuarioDialog.value = false;
    submitted.value = false;
}


async function saveUsuario() {
    submitted.value = true;
    
    if (usuario?.value.login?.trim() && usuario?.value.email?.trim()) { 
        const sanitizeValue = (value) => {
            return value && typeof value === 'string' ? value.trim() : '';
        };

        // Sanitizar los valores
        const usuarioData = {
            login: sanitizeValue(usuario.value.login),
            email: sanitizeValue(usuario.value.email),
            password: usuario.value.password ? usuario.value.password.trim() : '',
            rol: usuario.value.rol,
            id_sede: usuario.value.id_sede || null,
            id_persona: usuario.value.id_persona || null
        };

        try {
            // Si el usuario tiene un 'id', es una actualización; si no, es una creación
            if (usuario.value.id) {
                await updateUsuario(usuario.value.id, usuarioData);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
            } else {
                await createUsuario(usuarioData);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
            }

            // Recargar los usuarios
            await cargarUsuarios();
            usuarioDialog.value = false;
            usuario.value = {};
        } catch (error) {
            console.error('Error al guardar el usuario:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el usuario', life: 3000 });
        }
    }
}

const openDialog = () => {
  showDialog.value = true;
};

// Variables para almacenar la persona seleccionada
const showDialog = ref(false);
const selectedPersona = ref(null);
const numeroDocumento = ref('');
const nombre = ref('');

// Función que se ejecuta cuando se selecciona una persona
const handleSelectPersona = (persona) => {
    selectedPersona.value = persona;
    numeroDocumento.value = persona.numeroDocumento;
    nombre.value = persona.nombre;
    usuario.value.id_persona = persona.id;
    usuario.value.nombre = `${persona.tipo_documento} ${persona.numero_documento} ${persona.nombreCompleto}`;
    usuario.value.email = persona.email;
    showDialog.value = false;
};

onMounted( () => {
    cargarSedes();
    cargarUsuarios();
})
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Usuario" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable 
                ref="dt"
                :value="usuarios"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :rowsPerPageOptions="[5,10,25,50,100]"
                paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                currentPageReportTemplate="Mostrando {first} de {last} - {totalRecords} usuarios"    
                >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Usuarios</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="id" header="#" sortable style="min-width: 5rem"></Column>
                <Column field="login" header="Login" sortable style="min-width: 6rem"></Column>
                <!--
                <Column field="persona.tipo_documento || persona.numero_documento" header="Tipo Documento" sortable style="min-width: 6rem"></Column>
                -->
                <Column header="Tipo Documento" sortable style="min-width: 6rem">
                    <template #body="slotProps">
                        {{ `${slotProps.data.persona.tipo_documento || ''} ${slotProps.data.persona.numero_documento || ''}` }}
                    </template>
                </Column>
                
                <Column field="persona.apellido" header="Apellidos" sortable style="min-width: 10rem"></Column>
                <Column field="persona.nombre" header="Nombres" sortable style="min-width: 10rem"></Column>
                <Column field="rol" header="Rol" sortable style="min-width: 8rem"></Column>

                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUsuario(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUsuario(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="usuarioDialog" :style="{ 'width': '650px' }" header="Usuario" :modal="true">
                <div class="flex flex-col gap-6">
                    <div class="grid grid-cols-12 gap-3">
                        <div class="col-span-4">
                            <label for="sede" class="block font-bold mb-3">Rol</label>
                            <Select id="sede" v-model="usuario.rol" :options="roles" optionLabel="label" optionValue="value" placeholder="Seleccione un rol" fluid />
                        </div>
                        <div class="col-span-8">
                            <label for="nomb" class="block font-bold mb-3">Nombre</label>
                            <InputGroup>
                                <InputText id="nomb" v-model="usuario.nombre" readonly fluid />
                                <InputGroupAddon>
                                    <Button icon="pi pi-list" severity="info" variant="text" @click="openDialog" />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        <PersonaBusqueda :showDialog="showDialog" @select-persona="handleSelectPersona"
                        :numeroDocumento="numeroDocumento" :nombre="nombre" @update:visible="showDialog = $event"/>
                    </div>

                    <div class="grid grid-cols-12 gap-3">
                        <!-- Campo Login -->
                        <div class="col-span-5">
                            <label for="login" class="block font-bold mb-3">Login</label>
                            <InputText id="login" v-model="usuario.login" required="true" fluid />
                            <small v-if="submitted && !usuario.login" class="text-red-500">Login es requerido.</small>
                        </div>

                        <!-- Campo Email -->
                        <div class="col-span-7">
                            <label for="email" class="block font-bold mb-3">Email</label>
                            <InputText id="email" v-model="usuario.email" required="true" fluid />
                            <small v-if="submitted && !usuario.email" class="text-red-500">Email es requerido.</small>
                        </div>
                    </div>

                    <div class="grid grid-cols-12 gap-3">
                        <!-- Campo Clave -->
                        <div class="col-span-5">
                            <label for="clave" class="block font-bold mb-3">Clave</label>
                            <InputText id="clave" v-model="usuario.password" type="password" required="true" fluid />
                            <small v-if="submitted && !usuario.clave" class="text-red-500">Clave es requerida.</small>
                        </div>

                        <!-- Campo Sede (Combo) -->
                        <div class="col-span-7">
                            <label for="sede" class="block font-bold mb-3">Sede</label>
                            <Select id="sede" v-model="usuario.id_sede" :options="sedes" optionLabel="label" optionValue="value" placeholder="Seleccione una sede" fluid />
                        </div>
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveUsuario" />
                </template>
            </Dialog>
        </div>
    </div>
</template>