import api from '@/service/Api';

export const getHorariosMedico = async (id_doctor) => {
    try {
        const response = await api.get(`/horarios/quiropracticos/${id_doctor}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener horarios del médico:', error);
        throw error;
    }
};

export const getHorariosDisponibles = async (fecha, id_quiropractico, dia, id_detalle_horario = null) => {
    try {
        const response = await api.get('/horarios/disponibles', {
            params: {
                fecha,
                id_quiropractico,
                dia,
                id_detalle_horario
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        throw error;
    }
};

export const upsertHorarios = async (data) => {
    try {
        const response = await api.post('/horarios/upsert', data);
        return response.data;
    } catch (error) {
        console.error('Error al guardar los horarios:', error);
        throw error;
    }
};