import api from "../Api";

export const getUnidadMedidas = async (cancelToken) => {
  try {
    const response = await api.get('/articulos/medidas', {
      cancelToken: cancelToken || null
    });
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('Error al obtener las unidades de medida', error)
    throw error
  }
}

export const updateUnidadMedidad = async (id, data) => {
  try {
    const response = await api.put(`/articulos/medidas/${id}`, data)
    return response.data
  }
  catch (error) {
    console.error('Error al actualizar la unidad de medida', error)
    throw error
  }
}