
export function formatDate(dateStr) {
    console.log("formatting", dateStr)
    var date = null
    if (typeof dateStr == 'object')
        date = dateStr
    else {
        let dt = dateStr.substring(0, 10);
        date = new Date(dt + 'T00:00:00');
    }

    console.log(date, dateStr, typeof dateStr)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * 
 * formatTime, formatea el tiempo especificamente para que el
 * servidor reconozca el formato
 * @param {*} timeStr -> 1:54:00 p.m
 * @returns '00:00' formato H:i requerido por el servidor
 */
export function formatTime(timeStr) {
    const partes = timeStr.split(':');
    const hora = partes[0].padStart(2, '0');
    const minutos = partes[1].padStart(2, '0');
    return `${hora}:${minutos}`;
}

export const handleServerError = (error, info, toast) => {
    console.error(error);
    toast.add({
        severity: 'error',
        summary: 'Hubo un error obteniendo la informacion: ' + info,
        life: 5000
    })
}