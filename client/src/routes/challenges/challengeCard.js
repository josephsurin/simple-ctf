import path from 'path'
import { h, Component } from 'preact'
import style from './style.sass'
import markdownit from 'markdown-it'
import DOMPurify from 'dompurify'
import { genStaticFilePath, apiRequest } from '../../util'
import Modal from '../../components/modal'

const md = markdownit({ html: true })

class ChallengeCard extends Component {
    state = { isOpen: false, submitting: false, submission: '', status: null }

    toggleOpen = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }

    closeModal = () => {
        this.setState({ isOpen: false })
    }

    onSubmissionChange = e => {
        let { value } = e.target
        this.setState({ submission: value, status: null })
    }

    submitFlag = e => {
        e.preventDefault()
        if(this.state.submitting) return
        this.setState({ submitting: true }, () => {
            let { submission } = this.state
            var data = { challid: this.props.data.id, submission }
            apiRequest('/submit', { method: 'POST', body: JSON.stringify(data) })
                .then(r => {
                    if(r.msg == 'correct') this.props.onSolve()
                    this.setState({ status: r.msg, submitting: false })
                })
        })
    }

    renderDetails = (id, description, files, submitting, submission, status) => (
        <div class={style.details}>
            <div class={style.description} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(md.render(description)) }}>
            </div>
            {files.length === 0 ? null :
            <div class={style.files_container}>
                Files:
                {files.map(relPath => {
                    var filename = path.basename(relPath)
                    var filePath = genStaticFilePath(path.join(id, relPath))
                    return <a class={style.file_link} href={filePath} download="download">{filename}</a>
                })}
            </div>}
            <div class={style.submission_container}>
                <form class={style.submission_form} onSubmit={this.submitFlag}>
                    <input class={submitting ? style.disabled : ''} type="text" placeholder="flag" value={submission} onInput={this.onSubmissionChange} />
                    <button class={submitting ? style.disabled : ''} type="submit">Submit</button>
                </form>
            </div>
            {status === 'incorrect' ? <div class={style.submission_incorrect}>Incorrect Flag</div> :
             status === 'correct' ? <div class={style.submission_correct}>Correct!</div> :
             status === 'already solved' ? <div class={style.submission_already_solved}>Already Solved</div> :
             status === 'rate limited' ? <div class={style.submission_incorrect}>Submitting too fast. Slow down!</div> : null}
        </div>
    )

    render({ data, cardStyle }, { isOpen, submitting, submission, status }) {
        let { id, title, category, points, description, numSolves, files, solved } = data
        return (
            <div class={cardStyle == 'list' ? style.list_challenge_card : cardStyle == 'tile' ? style.tile_challenge_card : ''}>
                {cardStyle == 'list' ?
                <button class={style.main_details} onClick={this.toggleOpen}>
                    {title} / {category} / {points} {points === 1 ? 'point' : 'points'} / {numSolves} {numSolves === 1 ? 'solve' : 'solves'}
                    {solved ? <span class={style.solved_indicator}>Solved</span> : null}
                </button>
                    :
                 cardStyle == 'tile' ?
                <button class={style.main_details + ' ' + (solved ? style.solved : '')} onClick={this.toggleOpen}>
                    <span class={style.title}>{title}</span>
                    <br/>
                    <span class={style.points}>{points}</span>
                </button>
                    :
                null
                }
                {!isOpen ? null :
                cardStyle == 'list' ?
                <Fragment>{this.renderDetails(id, description, files, submitting, submission, status)}</Fragment>
                    :
                cardStyle == 'tile' ?
                <Modal open={isOpen} onDismiss={this.closeModal}>
                    <div class={style.tile_modal_inner}>
                        <div class={style.title}>{title}</div>
                        <div class={style.points_and_solves}>{points} {points === 1 ? 'point' : 'points'} / {numSolves} {numSolves === 1 ? 'solve' : 'solves'}</div>
                        {this.renderDetails(id, description, files, submitting, submission, status)}
                    </div>
                </Modal>
                    :
                null
                }
            </div>
        )
    }
}

export default ChallengeCard
