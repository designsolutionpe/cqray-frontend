import api from '@/service/Api';

export const getUsuarios = async (cancelToken) => {
    try {
        const response = await api.get('/usuarios', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
}

export const getUsuarioById = async (id, cancelToken) => {
    try {
        const response = await api.get(`/usuarios/${id}`, {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data;
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error;
    }
};

// Crear un nuevo usuario
export const createUsuario = async (data) => {
    try {
        const response = await api.post('/usuarios', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

// Actualizar usuario
export const updateUsuario = async (id, data) => {
    try {
        const response = await api.put(`/usuarios/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error.response?.data || error);
        throw error;
    }
};

// Actualizar usuario y persona
export const updateUsuarioPersona = async (id, formData) => {

    formData.append('_method', 'PUT');
    try {
        const response = await api.post(`/usuario-persona/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar Usuario/Persona:', error.response?.data || error);
        throw error;
    }
};

// Eliminar un usuario
export const deleteUsuario = async (id) => {
    try {
        await api.delete(`/usuarios/${id}`);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};