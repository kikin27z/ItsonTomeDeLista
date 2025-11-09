
/*
    Aca bien dry para no repetir tanto código cree esta cura.
        T = El objeto que devuelve la petición
        S = El cuerpo que vendrá en la petición
 */
export async function  requestByPost<T, S>(url: string, body: S) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }).then(data => data as T);
}