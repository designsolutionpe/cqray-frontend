import api from "@/service/Api";

export const getTipoSeguros = async (cT = null) => {
  try {
    const response = await api.get('/tipos-seguro', {
      cancelToken: cT
    });
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('tipo seguros', error)
    throw error
  }
}

export const createTipoSeguro = async (data) => {
  try {
    const response = await api.post('/tipos-seguro', data)
    return response.data
  }
  catch (error) {
    console.error('tipo seguros', error)
    throw error
  }
}

export const updateTipoSeguro = async (id, data) => {
  try {
    const response = await api.put(`/tipos-seguro/${id}`, data)
    return response.data
  }
  catch (error) {
    console.error('tipo seguros', error)
    throw error
  }
}

export const deleteTipoSeguro = async (id) => {
  try {
    const response = await api.delete(`/tipos-seguro/${id}`)
    return response.data
  }
  catch (error) {
    console.error('tipo seguros', error)
    throw error
  }
}