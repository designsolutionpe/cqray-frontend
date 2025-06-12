import api from '@/service/Api'

export const getCajaChica = async (cancelToken, sede = "", tipo = "", tipo_fecha = "Diario", fecha = "") => {
    try {
        const response = await api.get(`/cajachica?sede=${sede}&tipo=${tipo}&tipo_fecha=${tipo_fecha}&fecha=${fecha}`, {
            cancelToken: cancelToken || null
        })
        if (typeof response.cancelled != 'undefined')
            return null

        return response.data
    }
    catch (error) {
        console.error("Caja chica", error)
        throw error
    }
}

export const insertCajaChicaValue = async (data) => {
    try {
        const response = await api.post(`/cajachica`, data)
        return response.data
    }
    catch (error) {
        console.error("Caja chica", error)
        throw error
    }
}