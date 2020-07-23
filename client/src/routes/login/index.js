import { h, Component } from 'preact'
import { route } from 'preact-router'
import style from './style.sass'
import { apiRequest, saveToken } from '../../util'

class Login extends Component {
    state = { username: '', password: '', msg: null, loading: false }

    onUsernameChange = e => {
        let { value } = e.target
        this.setState({ username: value })
    }

    onPasswordChange = e => {
        let { value } = e.target
        this.setState({ password: value })
    }

    onSubmit = e => {
        let { username, password, loading } = this.state
        if(loading) return e.preventDefault()
        this.setState({ loading: true }, () => {
            var data = { username, password }
            apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }, false)
                .then(r => {
                    if(r.unauthorized) return this.setState({ msg: 'Invalid username or password', loading: false })
                    if(r.msg && r.msg == 'rate limited') return this.setState({ msg: 'Too many attempts. Please wait a bit.', loading: false })
                    saveToken(r.token)
                    route('/challenges')
                }).catch(err => {
                    console.log('error occured: ', err)
                })
            e.preventDefault()
        })
    }

    render(_, { username, password, msg, loading }) {
        return (
            <div class={style.login}>
                <h1>Login</h1>
                {msg ? <div class={style.msg}>{msg}</div> : null}
                <form class={style.form} onSubmit={this.onSubmit}>
                    <input required type="text" placeholder="username" value={username} onInput={this.onUsernameChange} />
                    <input required type="password" placeholder="password" value={password} onInput={this.onPasswordChange} />
                    <div class={style.login_button_div + ' ' + (loading ? style.disabled : '')}><button type="submit">Login</button></div>
                </form>
            </div>
        )
    }
}

export default Login
