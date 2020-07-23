import { h, Component } from 'preact'
import style from './style.sass'

import { apiRequest, groupBy } from '../../util'
import Loader from '../../components/loader/'
import ChallengeCard from './challengeCard'

class Challenges extends Component {
    state = { challenges: null, err: null, viewStyle: localStorage.getItem('viewpref') || 'tile' }

    componentDidMount() {
        this.loadData()
    }

    loadData = () => {
        apiRequest('/challenges')
            .then(r => {
                if(r.err && r.err == 'Game has not started yet.') return this.setState({ err: r.err })
                r.challenges.sort((a, b) => a.sortIndex - b.sortIndex)
                this.setState({ challenges: r.challenges })
            })
    }

    changeViewStyle = (viewStyle) => {
        localStorage.setItem('viewpref', viewStyle)
        this.setState({ viewStyle })
    }

    renderListChallenges = (challenges) => (
        challenges.map(c => <ChallengeCard cardStyle="list" data={c} onSolve={this.loadData} />)
    )

    // grouped by category, sorted by number of sortIndex
    renderTileChallenges = (challenges) => {
        const catMap = groupBy(challenges, x => x.category) 
        return Array.from(catMap.keys(), category => {
            catMap.get(category).sort((a, b) => a.sortIndex - b.sortIndex)
            return (
            <div class={style.category_container}>
                <div class={style.category_header}>{category}</div>
                <div class={style.category_challenges_container}>
                    {catMap.get(category).map(c => 
                        <ChallengeCard cardStyle="tile" data={c} onSolve={this.loadData} />
                    )}
                </div>
            </div>
            )
        })
    }

    render(_, { challenges, err, viewStyle }) {
        if(err) return (
            <div class={style.challenges}>
                <div class={style.challenges_container}>
                    <h1>Challenges</h1>
                    <div class={style.err_msg}>{err}</div>
                </div>
            </div>
        )
        return (
            <div class={style.challenges}>
                <div class={style.challenges_container}>
                    <h1>Challenges</h1>
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
