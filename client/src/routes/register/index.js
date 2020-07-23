import { h, Component } from 'preact'
import { route } from 'preact-router'
import style from './style.sass'
import { apiRequest } from '../../util'

class Register extends Component {
    state = { username: '', email: '', password: '', msg: '', loading: false }

    onUsernameChange = e => {
        let { value } = e.target
        this.setState({ username: value })
    }

    onEmailChange = e => {
        let { value } = e.target
        this.setState({ email: value })
    }

    onPasswordChange = e => {
        let { value } = e.target
        this.setState({ password: value })
    }

    onSubmit = e => {
        let { username, email, password, loading } = this.state
        if(loading) return e.preventDefault()
        this.setState({ loading: true }, () => {
            var data = { username, email, password }
            apiRequest('/register', { method: 'POST', body: JSON.stringify(data) })
                .then(r => {
                    if(r.err) return this.setState({ msg: r.err, loading: false })
                    route('/login')
                }).catch(err => {
                    console.log('error occured: ', err)
                })
            e.preventDefault()
        })
    }

    render(_, { username, email, password, msg, loading }) {
        return (
            <div class={style.register}>
                <h1>Register</h1>
                {msg ? <div class={style.msg}>{msg}</div> : null}
                <form class={style.form} onSubmit={this.onSubmit}>
                    <input required type="text" placeholder="username" value={username} onInput={this.onUsernameChange} />
                    <input required type="email" placeholder="email" value={email} onInput={this.onEmailChange} />
                    <input required type="password" placeholder="password" value={password} onInput={this.onPasswordChange} />
                    <div class={style.register_button_div + ' ' + (loading ? style.disabled : '')}><button type="submit">Register</button></div>
                </form>
            </div>
        )
    }
}

export default Register
