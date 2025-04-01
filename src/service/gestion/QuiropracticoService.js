import api from '@/service/Api';

export const getQuiropracticos = async () => {
    try {
        const response = await api.get('/doctores');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los quiropracticos:', error);
        throw error;
    }
}

export const createQuiropractico = async (data) => {
    try {
        const response = await api.post('/doctores', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear el quiropractico:', error.response?.data || error);
        throw error;
    }
}

export const updateQuiropractico = async (id, data) =>{
    data.append('_method', 'PUT');
    try {
        const response = await api.post(`/doctores/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el quiropractico:', error.response?.data || error);
        throw error;
    }
}

export const deleteQuiropractico = async (id) => {
    try {
        const response = await api.delete(`/doctores/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el quiropractico:', error);
        throw error;
    }
}