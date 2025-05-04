import api from "../Api";

export const getRoles = async (cancelToken, estado = null) => {
    try {
        const response = await api.get(`/roles${estado ? '?estado=' + estado : ''}`, {
            cancelToken: cancelToken || null
        })
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data
    }
    catch (error) {
        console.error('Error al obtener roles:', error);
        throw error;
    }
}

export const createRole = async (data) => {
    try {
        const response = await api.post('/roles', data)
        return response.data
    }
    catch (error) {
        console.error('Error al crear role:', error);
        throw error;
    }
}

export const updateRole = async (id, data) => {
    try {
        const response = await api.put(`/roles/${id}`, data)
        return response.data
    }
    catch (error) {
        console.error('Error al actualizar un rol:', error);
        throw error;
    }
}

export const deleteRole = async (id) => {
    try {
        const response = await api.delete(`/roles/${id}`)
        return response.data
    }
    catch (error) {
        console.error('Error al eliminar un rol:', error);
        throw error;
    }
}