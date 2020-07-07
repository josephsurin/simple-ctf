import path from 'path'
import { h, Component } from 'preact'
import style from './style.sass'
import markdownit from 'markdown-it'
import DOMPurify from 'dompurify'
import { genStaticFilePath } from '../../util'

const md = markdownit()

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
        let { id, title, category, points, description, numSolves, files } = data
        return (
            <div class={style.challenge_card}>
                <button class={style.main_details} onClick={this.toggleOpen}>
                    {title} / {category} / {points} {points === 1 ? 'point' : 'points'} / {numSolves} {numSolves === 1 ? 'solve' : 'solves'}
                </button>
                {!isOpen ? null :
                <div class={style.details}>
                    <div class={style.description} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(md.render(description)) }}>
                    </div>
                    {files.length === 0 ? null :
                    <div class={style.files_container}>
                        Files:
                        {files.map(relPath => {
                            var filename = path.basename(relPath)
                            var filePath = genStaticFilePath(path.join(id, relPath))
                            return <a class={style.file_link} href={filePath}>{filename}</a>
                        })}
                    </div>}
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
