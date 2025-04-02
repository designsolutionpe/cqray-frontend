import api from "@/service/Api";

// Obtener todos los pagos
export const getPagos = async () => {
    try {
        const response = await api.get('/pagos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
        throw error;
    }
};

// Crear nuevo medio de pago
export const createPago = async (data) => {
    try {
        const response = await api.post('/pagos', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear el pago:', error);
        throw error;
    }
};

// Actualizar medio de pago
export const updatePago = async (id, data) => {
    try {
        const response = await api.put(`/pagos/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el pago:', error.response?.data || error);
        throw error;
    }
};

// Cambiar solo el estado del pago
export const updatePagoEstado = async (id, estado) => {
    try {
        const response = await api.put(`/pagos/${id}/estado`, { estado });
        return response.data;
    } catch (error) {
        console.error('Error al cambiar el estado del pago:', error);
        throw error;
    }
};

// Eliminar un medio de pago
export const deletePago = async (id) => {
    try {
        await api.delete(`/pagos/${id}`);
    } catch (error) {
        console.error('Error al eliminar el pago:', error);
        throw error;
    }
};