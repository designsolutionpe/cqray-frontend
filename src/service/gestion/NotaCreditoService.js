import api from '@/service/Api';

export const getNotaCreditos = async (cancelToken) => {
    try {
        const response = await api.get('/notas-creditos', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled !== 'undefined')
            return null;
        return response.data;
    } catch (error) {
        console.error('Error al obtener las notas de crédito:', error);
        throw error;
    }
}

export const createNotaCredito = async (data) => {
    try {
        const response = await api.post('/notas-creditos', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la nota de crédito:', error.response?.data || error);
        throw error;
    }
};

export const updateNotaCredito = async (id, data) => {  
    data._method = 'PUT';
    try {
        const response = await api.post(`/notas-creditos/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la nota de crédito:', error.response?.data || error);
        throw error;
    }
}

export const deleteNotaCredito = async (id) => {
    try {
        const response = await api.delete(`/notas-creditos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la nota de crédito:', error);
        throw error;
    }
};
