import { h, Component } from 'preact'
import style from './style.sass'

class ChallengeCard extends Component {
    state = { isOpen: false, submission: '' }

    toggleOpen = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onSubmissionChange = e => {
        let { value } = e.target
        this.setState({ submission: value })
    }

    render({ data }, { isOpen, submission }) {
        let { title, category, points, description, numSolves, files } = data
        return (
            <div class={style.challenge_card}>
                <button class={style.main_details} onClick={this.toggleOpen}>
                    {title} / {category} / {points} {points === 1 ? 'point' : 'points'} / {numSolves} {numSolves === 1 ? 'solve' : 'solves'}
                </button>
                {!isOpen ? null :
                <div class={style.details}>
                    <div class={style.description}>
                        {description}
                    </div>
                    <div class={style.submission_container}>
                        <form class={style.submission_form}>
                            <input type="text" placeholder="flag" value={submission} onInput={this.onSubmissionChange} />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>}
            </div>
        )
    }
}

export default ChallengeCard
