import { h, Component } from 'preact'
import { route } from 'preact-router'
import style from './style.sass'
import { apiRequest } from '../../util'

class EditProfile extends Component {
    state = { username: '', memberEmail: '', currentEmail: '', email: '', newpassword: '', oldpassword: '', members: [], msg: '', success: null }

    onMemberEmailChange = e => {
        let { value } = e.target
        this.setState({ memberEmail: value })
    }

    onEmailChange = e => {
        let { value } = e.target
        this.setState({ email: value })
    }

    onNewPasswordChange = e => {
        let { value } = e.target
        this.setState({ newpassword: value })
    }

    onOldPasswordChange = e => {
        let { value } = e.target
        this.setState({ oldpassword: value })
    }
    
    onAddMemberSubmit = e => {
        let { memberEmail } = this.state
        var data = { memberEmail }
        apiRequest('/addmember', { method: 'POST', body: JSON.stringify(data) })
            .then(r => {
                if(r.err) return this.setState({ msg: r.err, success: false })
                this.loadData()
                return this.setState({ msg: r.msg, success: true })
            }).catch(err => console.log('error occurred: ', err))
        e.preventDefault()
    }

    onChangeEmailSubmit = e => {
        let { email } = this.state
        var data = { email }
        apiRequest('/changeemail', { method: 'POST', body: JSON.stringify(data) })
            .then(r => {
                if(r.err) return this.setState({ msg: r.err, success: false })
                this.loadData()
                return this.setState({ msg: r.msg, success: r.msg != 'rate limited' })
            }).catch(err => console.log('error occurred: ', err))
        e.preventDefault()
    }

    onChangePasswordSubmit = e => {
        let { oldpassword, newpassword } = this.state
        var data = { oldpassword, newpassword }
        apiRequest('/changepassword', { method: 'POST', body: JSON.stringify(data) })
            .then(r => {
                if(r.err) return this.setState({ msg: r.err, success: false })
                this.loadData()
                return this.setState({ msg: r.msg, success: r.msg != 'rate limited' })
            }).catch(err => console.log('error occurred: ', err))
        e.preventDefault()
    }

    removeMember = memberEmail => {
        var data = { memberEmail }
        apiRequest('/removemember', { method: 'POST', body: JSON.stringify(data) })
            .then(r => {
                if(r.err) return this.setState({ msg: r.err, success: false })
                this.loadData()
                return this.setState({ msg: r.msg, success: true })
            }).catch(err => console.log('error occurred: ', err))
    }

    componentDidMount = () => {
        this.loadData()
    }

    loadData = () => {
        apiRequest('/getdetails')
            .then(r => this.setState({ username: r.username, currentEmail: r.email, members: r.members }))
            .catch(err => console.log('error occurred: ', err))
    }

    render(_, { username, memberEmail, currentEmail, email, oldpassword, newpassword, members, msg, success }) {
        return (
            <div class={style.editprofile}>
                <h1>Edit Profile</h1>
                <div class={style.current_details}>
                    username: <b>{username}</b> <br/>
                    email: <b>{currentEmail}</b> <br/>
                    other team members:
                        <ul>{members.length == 0 ? <b>none yet!</b> : members.map(member => <li><b>{member} <a onClick={this.removeMember.bind(this, member)}>[X]</a></b></li>)}</ul>
                </div>
                <form class={style.email_form} onSubmit={this.onAddMemberSubmit}>
                    <input type="email" placeholder="add member email" value={memberEmail} required="required" onInput={this.onMemberEmailChange} />
                    <button type="submit">Add Member</button>
                </form>
                <form class={style.email_form} onSubmit={this.onChangeEmailSubmit}>
                    <input type="email" placeholder="new email" value={email} required="required" onInput={this.onEmailChange} />
                    <button type="submit">Update Email</button>
                </form>
                <form class={style.form} onSubmit={this.onChangePasswordSubmit}>
                    <input type="password" placeholder="old password" value={oldpassword} required="required" onInput={this.onOldPasswordChange} />
                    <input type="password" placeholder="new password" value={newpassword} required="required" onInput={this.onNewPasswordChange} />
                    <div class={style.submit}><button type="submit">Update Password</button></div>
                </form>
                {msg ? <div class={success ? style.success_msg : style.error_msg}>{msg}</div> : null}
            </div>
        )
    }
}

export default EditProfile
