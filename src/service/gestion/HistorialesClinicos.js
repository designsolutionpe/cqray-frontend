import api from "../Api"

export const getHistorialesPacientes = async (cancelToken) => {
  try {
    const response = await api.get('/historias-clinicas', {
      cancelToken: cancelToken || null
    })
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('error en servicio Historiales Clinicos al obtener los de los pacientes')
    throw error
  }
}

export const linkWithCita = async (id,id_cita) => {
    try
    {
        const response = await api.put(`/historias-clinicas/${id}/link`, { id_cita })
        return response.data
    }
    catch(error)
    {
        console.error("Error linkeando la cita: ",error)
        throw error
    }
}