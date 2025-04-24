import api from '@/service/Api';

export const getComprobantes = async (cancelToken) => {
    try {
        const response = await api.get('/comprobantes', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled !== 'undefined')
            return null;
        return response.data;
    } catch (error) {
        console.error('Error al obtener los comprobantes:', error);
        throw error;
    }
};

export const getBuscarComprobantes = async (
    { serie = '', numero = ''}) => {
    try {
        const response = await api.get('/comprobantes/buscar', {
            params: { serie, numero }
        });
        return response.data;
    } catch (error) {
        console.error('Error al buscar los comprobantes:', error);
        throw error;
    }
}

export const getComprobantesCount = async (sede,cancelToken) => {
  try
  {
    const response = await api.get(`/comprobantes/count?id_sede=${sede||""}`,{
      cancelToken: cancelToken || null
    });
    if(typeof response.cancelled !== "undefined" )
      return null
    return response.data
  }
  catch(error)
  {
    console.error("Error al obtener la cantidas de pagos",error)
    throw error
  }
}

export const createComprobante = async (data) => {
    try {
        const response = await api.post('/comprobantes', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear el comprobante:', error.response?.data || error);
        throw error;
    }
};

export const updateComprobante = async (id, data) => {
    data._method = 'PUT';
    try {
        const response = await api.post(`/comprobantes/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el comprobante:', error.response?.data || error);
        throw error;
    }
};

export const deleteComprobante = async (id) => {
    try {
        const response = await api.delete(`/comprobantes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el comprobante:', error);
        throw error;
    }
};