<script setup>


const props = defineProps({
  oPaciente: Object
})

</script>
<template>

  <div class="p-4 flex flex-col gap-5">
    <div id="personal-informacion">
      <p class="text-xl font-bold text-secondary">Información personal</p>
      <div class="grid grid-cols-3 gap-5">
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Tipo documento</p>
          <p class="">{{ props.oPaciente.persona.tipo_documento || '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Numero documento</p>
          <p class="">{{ props.oPaciente.persona.numero_documento || '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Nombre completo</p>
          <p class="">{{ props.oPaciente.persona.nombre || '---' }} {{ props.oPaciente.persona.apellido || '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Género</p>
          <p class="">{{ props.oPaciente.persona.genero || '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Fecha de nacimiento</p>
          <p class="">{{ props.oPaciente.persona.fecha_nacimiento }}</p>
        </div>
      </div>
    </div>

    <div id="paciente-informacion">
      <p class="text-xl font-bold text-secondary">Información de paciente</p>
      <div class="grid grid-cols-3 gap-5">
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Sede</p>
          <p>{{ props.oPaciente.sede.nombre || '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Estado</p>
          <p>{{ props.oPaciente.estado.nombre || '---' }}</p>
        </div>
      </div>
    </div>

    <div id="servicio-informacion">
      <p class="text-xl font-bold text-secondary">Información de servicio</p>
      <div class="grid grid-cols-3 gap-5">
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Paquete</p>
          <p>{{ props.oPaciente.paquete_activo.paquete ? props.oPaciente.paquete_activo.paquete.nombre : '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
          <p class="text-gray-400 m-0">Precio total</p>
          <p>S/{{ props.oPaciente.paquete_activo.paquete ? props.oPaciente.paquete_activo.paquete.precio_venta : '---' }}</p>
        </div>
        <div class="col-span-3 md:col-span-1 flex flex-col">
            <p class="text-gray-400 m-0">Deuda pendiente</p>
            <p>S/{{ props.oPaciente.deuda ? (parseFloat(props.oPaciente.deuda) / 100).toFixed(2) : "---" }}</p>
        </div>
      </div>
    </div>
  </div>

</template>