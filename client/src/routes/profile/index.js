import { h, Component } from 'preact'
import ordinal from 'ordinal'
import style from './style.sass'

import { apiRequest } from '../../util'
import Loader from '../../components/loader/'

class Profile extends Component {
    state = { data: null }

    componentDidMount() {
        this.loadData()
    }

    loadData = () => {
        var username = this.props.username
        apiRequest('/profile' + (username ? '/' + username : ''))
            .then(data => this.setState({ data }))
    }

    formatSolves = (solves, challenges) => {
        return (
            <table>
                <tr>
                    <th>Challenge</th>
                    <th>Category</th>
                    <th>Solve Time</th>
                    <th>Points</th>
                </tr>
            {solves.map(solve =>  {
                let { title, category, points } = challenges.find(chall => chall.id == solve.chall)
                return (
                    <tr>
                        <td>{title}</td>
                        <td>{category}</td>
                        <td>{new Date(solve.time).toLocaleString()}</td>
                        <td>{points}</td>
                    </tr>
                )
            })}
            </table>
        )
    }

    render(_, { data }) {
        console.log(data)
        if(!data) {
            return (
                <div class={style.profile}>
                    <Loader />
                </div>
            )
        }
        let { userData, position, solves, challenges } = data
        return (
            <div class={style.profile}>
                <div class={style.username}>{userData.username}</div>
                <div class={style.position}>{ordinal(position)} place</div>
                
                {this.formatSolves(solves, challenges)}
            </div>
        )
    }
}

export default Profile
