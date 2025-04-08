import api from '@/service/Api';

export const getComprobantes = async () => {
    try {
        const response = await api.get('/comprobantes');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los comprobantes:', error);
        throw error;
    }
}