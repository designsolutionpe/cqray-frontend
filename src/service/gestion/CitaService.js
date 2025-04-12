import api from '@/service/Api';

export const getCitaEstados = async (cancelToken) => {
    try {
        const response = await api.get('/citas/estados', {
            cancelToken: cancelToken || null
        })
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data;
    } catch (error) {
        console.error('error en servicio "getCitaEstados" al obtener estados de cita: ', error)
        throw error
    }
}

export const getCitas = async (cancelToken) => {
    try {
        const response = await api.get('/citas', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled != 'undefined')
            return []
        return response.data;
    } catch (error) {
        console.error('Error al obtener las citas:', error);
        throw error;
    }
}

export const getCitasPorFecha = async (fecha, idSede = null, cancelToken) => {
    try {
        const response = await api.get('/citas/fechas', {
            params: {
                fecha: fecha,
                ...(idSede && { id_sede: idSede })
            },
            cancelToken: cancelToken || null
        });

        if (typeof response.cancelled !== 'undefined')
            return [];

        return response.data;
    } catch (error) {
        console.error('Error al obtener las citas por fecha:', error);
        throw error;
    }
}


// Crear una nueva cita
export const createCita = async (data) => {
    try {
        const response = await api.post('/citas', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la cita:', error);
        throw error;
    }
};

// Actualizar una cita existente
export const updateCita = async (id, data) => {
    try {
        const response = await api.put(`/citas/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la cita:', error);
        throw error;
    }
};

// Eliminar una cita
export const deleteCita = async (id) => {
    try {
        const response = await api.delete(`/citas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        throw error;
    }
};