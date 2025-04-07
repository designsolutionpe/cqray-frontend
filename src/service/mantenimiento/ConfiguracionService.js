import api from "@/service/Api";

export const getConfiguracion = async () => {
    try {
        const response = await api.get('/configuracion');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la configuración:', error);
        throw error;
    }
};

export const updateConfiguracion = async (id, data) => {
    data.append('_method', 'PUT');
    try {
        const response = await api.post(`/configuracion/${id}`, data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la configuración:', error.response?.data || error);
        throw error;
    }
}