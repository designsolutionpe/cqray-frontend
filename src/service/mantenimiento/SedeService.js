import api from '@/service/Api';

export const getSedes = async () => {
    try {
        const response = await api.get('/sedes');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las sedes:', error);
        throw error;
    }
};

// Obtener una sede por ID
export const getSedeById = async (id) => {
    try {
        const response = await api.get(`/sedes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la sede:', error);
        throw error;
    }
};

// Crear una nueva sede
export const createSede = async (data) => {
    try {
        const response = await api.post('/sedes', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear la sede:', error);
        throw error;
    }
};

// Actualizar una sede
export const updateSede = async (id, data) => {

    data.append('_method', 'PUT');
    try {
        const response = await api.post(`/sedes/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la sede:', error.response?.data || error);
        throw error;
    }
};

// Eliminar una sede
export const deleteSede = async (id) => {
    try {
        await api.delete(`/sedes/${id}`);
    } catch (error) {
        console.error('Error al eliminar la sede:', error);
        throw error;
    }
};