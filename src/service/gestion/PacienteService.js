import api from '@/service/Api';

export const getPacienteEstados = async (cancelToken) => {
    try {
        const response = await api.get('/pacientes/estados', {
            cancelToken: cancelToken || null
        })
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data
    } catch (error) {
        console.error('error en servicio "getPacienteEstados" al obtener estados de pacientes: ', error)
        throw error
    }
}

export const getPacientes = async (cancelToken) => {
    try {
        const response = await api.get('/pacientes', {
            cancelToken: cancelToken || null
        });
        if (typeof response.cancelled != 'undefined')
            return null
        return response.data;
    } catch (error) {
        console.error('Error al obtener los pacientes:', error);
        throw error;
    }
}

export const createPaciente = async (data) => {
    try {
        const response = await api.post('/pacientes', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear el paciente:', error.response?.data || error);
        throw error;
    }
};


export const updatePaciente = async (id, data) => {

    data.append('_method', 'PUT');
    try {
        const response = await api.post(`/pacientes/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el paciente:', error.response?.data || error);
        throw error;
    }
}

export const deletePaciente = async (id) => {
    try {
        const response = await api.delete(`/pacientes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el paciente:', error);
        throw error;
    }
};
