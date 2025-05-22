import api from "@/service/Api"

export const getEmpleados = async (cT = null, sede = null) => {
  try {
    const response = await api.get(`/empleados?sede=${sede}`, {
      cancelToken: cT
    })
    if (typeof response.cancelled != 'undefined')
      return null

    return response.data
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

export const createEmpleado = async (data) => {
  try {
    const response = await api.post('/empleados', data)
    return response.data
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

export const editEmpleado = async (id, data) => {
  try {
    const response = await api.put(`/empleados/${id}`, data)
    return response.data
  }
  catch (error) {
    console.error(error)
    throw error
  }
}