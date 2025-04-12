import api from '@/service/Api';

export const getPersonas = async (cancelToken) => {
    try {
        const response = await api.get('/personas', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data;
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        throw error;
    }
}

export const createPersona = async (data) => {
    try {
        const response = await api.post('/personas', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear persona:', error.response?.data || error);
        throw error;
    }
};

export const updatePersona = async (id, data) => {
    data.append('_method', 'PUT');
    try {
        const response = await api.post(`/personas/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar persona:', error.response?.data || error);
        throw error;
    }
};

export const deletePersona = async (id) => {
    try {
        const response = await api.delete(`/personas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar persona:', error.response?.data || error);
        throw error;
    }
};



export const getBuscarPersonas = async (
    { nombre = '', numero_documento = '', id_persona = null }) => {
    try {
        const response = await api.get('/personas/buscar', {
            params: {
                nombre,
                numero_documento,
                id_persona
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al buscar personas:', error);
        throw error;
    }
};