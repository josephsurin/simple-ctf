import path from 'path'
import { route } from 'preact-router'
import config from '../config'
const { apiEndpoint, staticFileRoot } = config

export const apiRequest = (endpoint, reqOpts, redirect='/login') => {
    var authHeader = getToken() ? { 'Authorization' : 'Bearer ' + getToken() } : {}
    var headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    headers = Object.assign(headers, authHeader)
    reqOpts = Object.assign({ headers }, reqOpts)
    return fetch(apiEndpoint + endpoint, reqOpts)
        .then(resp => resp.text())
        .then(resp => {
            if(resp == 'Bad Request' || resp == 'Unauthorized') {
                if(redirect) route(redirect)
                removeToken()
                return { unauthorized: true }
            }
            return JSON.parse(resp)
        })
        .catch(err => console.debug(err))
}

export const isLoggedIn = () => {
    return localStorage.getItem('token') != null
}

export const saveToken = (token) => {
    localStorage.setItem('token', token)
}

export const removeToken = () => {
    localStorage.removeItem('token')
}

const getToken = () => {
    return localStorage.getItem('token')
}

export const genStaticFilePath = (p) => staticFileRoot + path.join('/', p)
