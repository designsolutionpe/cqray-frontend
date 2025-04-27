import api from "../Api";

export const getTiposPagos = async (cancelToken) => {
  try {
    const response = await api.get('/tipos-pago', {
      cancelToken: cancelToken || null
    });
    if (typeof response.cancelled != 'undefined')
      return null
    return response.data
  }
  catch (error) {
    console.error('Error al obtener los tipos de pagos', error);
    throw error
  }
}