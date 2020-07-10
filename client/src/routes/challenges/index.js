import { h, Component } from 'preact'
import style from './style.sass'

import { apiRequest, groupBy } from '../../util'
import Loader from '../../components/loader/'
import ChallengeCard from './challengeCard'

class Challenges extends Component {
    state = { challenges: null, viewStyle: localStorage.getItem('viewpref') || 'tile' }

    componentDidMount() {
        this.loadData()
    }

    loadData = () => {
        apiRequest('/challenges')
            .then(r => this.setState({ challenges: r.challenges }))
    }

    changeViewStyle = (viewStyle) => {
        localStorage.setItem('viewpref', viewStyle)
        this.setState({ viewStyle })
    }

    renderListChallenges = (challenges) => (
        challenges.map(c => <ChallengeCard cardStyle="list" data={c} onSolve={this.loadData} />)
    )

    // grouped by category, sorted by number of points  (for now)
    renderTileChallenges = (challenges) => {
        const catMap = groupBy(challenges, x => x.category) 
        return Array.from(catMap.keys(), category => (
            <div class={style.category_container}>
                <div class={style.category_header}>{category}</div>
                <div class={style.category_challenges_container}>
                    {catMap.get(category).map(c => 
                        <ChallengeCard cardStyle="tile" data={c} onSolve={this.loadData} />
                    )}
                </div>
            </div>
        ))
    }

    render(_, { challenges, viewStyle }) {
        return (
            <div class={style.challenges}>
                <div class={style.challenges_container}>
                    {!challenges ? null :
                    <div class={style.challenges_view_menu}>
                        <button class={style.tile_button + ' ' + (viewStyle == 'tile' ? style.active_view_button : '')} onClick={this.changeViewStyle.bind(this, 'tile')}>Tiles</button>
                        <button class={style.list_button + ' ' + (viewStyle == 'list' ? style.active_view_button : '')} onClick={this.changeViewStyle.bind(this, 'list')}>List</button>
                    </div>
                    }
                    {!challenges ? <Loader /> :
                    viewStyle == 'list' ? 
                        <Fragment>{this.renderListChallenges(challenges)}</Fragment> :
                    viewStyle == 'tile' ?
                        <Fragment>{this.renderTileChallenges(challenges)}</Fragment> :
                        null
                    }
                </div>
            </div>
        )
    }
}

export default Challenges
