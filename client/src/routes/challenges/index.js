import { h, Component } from 'preact'
import style from './style.sass'

import { apiRequest } from '../../util'
import Loader from '../../components/loader/'
import ChallengeCard from './challengeCard'

class Challenges extends Component {
    state = { challenges: null }

    componentDidMount() {
        apiRequest('/challenges')
            .then(r => this.setState({ challenges: r.challenges }))
    }

    render(_, { challenges }) {
        console.log(challenges)
        return (
            <div class={style.challenges}>
                <div class={style.challenges_container}>
                    {!challenges ? <Loader /> :
                    challenges.map(c => <ChallengeCard data={c} />)}
                </div>
            </div>
        )
    }
}

export default Challenges