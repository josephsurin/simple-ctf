const apiEndpoint = 'http://localhost:3000/api'

export const apiRequest = (endpoint, options) => {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    options = Object.assign({ headers }, options)
    return fetch(apiEndpoint + endpoint, options)
        .then(resp => resp.text())
        .then(resp => {
            if(resp == 'Unauthorized') {
                return { err: 'Unauthorized' }
            }
            return JSON.parse(resp)
        })
        .catch(err => console.debug(err))
}
