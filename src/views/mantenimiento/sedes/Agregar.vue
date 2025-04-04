<script setup>
import { useToast } from 'primevue';
import { ref } from 'vue';

const toast = useToast();
const selectedFile = ref(null);
const sede = ref({})
const previewSrc = ref(null);
const submitted = ref(false);

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
  sede.value.foto = null;
  selectedFile.value = null;
  previewSrc.value = null;
}

function saveSede() { }

</script>
<template>
  <div class="card xl:w-1/2">
    <p class="text-3xl font-bold">Agregar nueva sede</p>
    <div class="grid grid-cols-12 gap-y-6 md:gap-6">
      <div class="col-span-12">
        <label for="nombre" class="block font-bold mb-3">Nombre</label>
        <InputText id="nombre" v-model.trim="sede.nombre" required="true" autofocus :invalid="submitted && !sede.nombre"
          fluid />
        <small v-if="submitted && !sede.nombre" class="text-red-500">Nombre de sede es requerido.</small>
      </div>
      <div class="col-span-12">
        <label for="direccion" class="block font-bold mb-3">Direccion</label>
        <Textarea id="direccion" v-model.trim="sede.direccion" required="true" rows="3" cols="20" fluid />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label for="telefono" class="block font-bold mb-3">Telefono</label>
        <InputText id="telefono" v-model="sede.telefono" fluid />
      </div>
      <div class="col-span-12 md:col-span-6">
        <label for="email" class="block font-bold mb-3">Email</label>
        <InputText id="email" v-model="sede.email" type="email" fluid />
      </div>

      <div class="col-span-12">
        <label for="foto" class="block font-bold mb-3">Foto</label>
        <div class="flex items-center gap-4">
          <FileUpload mode="basic" name="foto" accept="image/*" chooseLabel="Seleccionar" :maxFileSize="1000000"
            @select="onFileSelect" customUpload auto class="p-button-outlined" />
          <div v-if="previewSrc" class="relative flex items-center">
            <img :src="previewSrc" alt="Foto seleccionada" class="w-32 h-32 rounded-lg shadow" />
            <Button icon="pi pi-trash" class="ml-2 p-2 rounded-full" severity="danger" @click="removeImage" />
          </div>
        </div>
      </div>

      <Button class="col-span-12" label="Agregar" icon="pi pi-check" @click="saveSede" />
    </div>
  </div>
</template>