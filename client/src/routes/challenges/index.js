import { h, Component } from 'preact'
import style from './style.sass'

import { apiRequest } from '../../util'
import Loader from '../../components/loader/'
import ChallengeCard from './challengeCard'

class Challenges extends Component {
    state = { challenges: null }

    componentDidMount() {
        this.loadData()
    }

    loadData = () => {
        apiRequest('/challenges')
            .then(r => this.setState({ challenges: r.challenges }))
    }

    render(_, { challenges }) {
        console.log(challenges)
        return (
            <div class={style.challenges}>
                <div class={style.challenges_container}>
                    {!challenges ? <Loader /> :
                    challenges.map(c => <ChallengeCard cardStyle="tile" data={c} onSolve={this.loadData} />)}
                </div>
            </div>
        )
    }
}

export default Challenges
