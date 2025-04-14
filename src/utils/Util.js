
export function formatDate(dateStr) {
    var date = null
    if (typeof dateStr == 'object')
        date = dateStr
    else
        date = new Date(dateStr + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export const handleServerError = (error, info, toast) => {
    console.error(error);
    toast.add({
        severity: 'error',
        summary: 'Hubo un error obteniendo la informacion: ' + info,
        life: 5000
    })
}