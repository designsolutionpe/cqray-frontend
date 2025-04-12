import api from "@/service/Api";

// CATEGORIA
export const getCategorias = async (cancelToken) => {
  try {
    const response = await api.get('/articulos/categorias', {
      cancelToken: cancelToken || null
    })
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data;
  }
  catch (error) {
    console.error('Error al obtener las categorias de articulos:', error)
    throw error;
  }
}

export const createCategoria = async (data) => {
  try {
    const response = await api.post('/articulos/categorias', data)
    return response.data
  }
  catch (error) {
    console.error('Error al crear la categoria:', error);
    throw error;
  }
}

export const updateCategoria = async (id, data) => {
  try {
    const response = await api.put(`/articulos/categorias/${id}`, data)
    return response.data
  }
  catch (error) {
    console.error('Error al actualizar la categoria:', error);
    throw error;
  }
}

export const deleteCategoria = async (id) => {
  try {
    await api.delete(`/articulos/categorias/${id}`)
  }
  catch (error) {
    console.error('Error al eliminar la categoria:', error);
    throw error;
  }
}