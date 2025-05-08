import api from '@/service/Api'

export const getCajaChica = async (cancelToken, sede="", tipo="") => {
    try
    {
        const response = await api.get(`/cajachica?sede=${sede}&tipo=${tipo}`,{
            cancelToken: cancelToken || null
        })
        if(typeof response.cancelled != 'undefined')
            return null

        return response.data
    }
    catch(error)
    {
        console.error("Caja chica",error)
        throw error
    }
} 
