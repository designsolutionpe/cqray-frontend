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

// ARTICULOS - SERVICIOS

export const getArticulosServicios = async (cancelToken) => {
  try {
    const response = await api.get('/articulos', {
      cancelToken: cancelToken || null
    })
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('Erro al obtener servicios', error)
    throw error;
  }
}

export const searchArticulos = async (idSede, tipoArticulo, cancelToken = null) => {
  try {
    const response = await api.get('/articulos/buscar', {
      params: {
        id_sede: idSede,
        tipo_articulo: tipoArticulo,
      },
      cancelToken: cancelToken || null,
    });
    if (typeof response.cancelled !== 'undefined') return null;
    return response.data;
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    throw error;
  }
};


export const createArticuloServicio = async (data) => {
  try {
    const response = await api.post('/articulos', data)
    return response.data
  }
  catch (error) {
    console.error('Erros al crear un servicio', error)
    throw error;
  }
}

export const updateArticuloServicio = async (id, data) => {
  try {
    const response = await api.put(`/articulos/${id}`, data)
    return response.data
  }
  catch (error) {
    console.error('Erro al actualizar servicio', error)
    throw error;
  }
}

export const deleteArticuloServicio = async (id) => {
  try {
    const response = await api.delete(`/articulos/${id}`)
    return response.data
  }
  catch (error) {
    console.error('Erro al actualizar servicio', error)
    throw error;
  }
}

// ARTICULOS - MEDIDAS

export const getMedidas = async (cancelToken) => {
  try {
    const response = await api.get('/articulos/medidas', {
      cancelToken: cancelToken || null
    })
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('Erro al actualizar servicio', error)
    throw error;
  }
}