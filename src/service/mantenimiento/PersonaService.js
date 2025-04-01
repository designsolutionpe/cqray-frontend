import api from '@/service/Api';

export const getPersonas = async (
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