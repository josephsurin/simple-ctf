import { h } from 'preact'
import { route } from 'preact-router'
import { removeToken } from '../../util'

const Logout = () => {
    removeToken()
    route('/login')
    return <div></div>
}

export default Logout
