import { h, Component } from 'preact'
import { Link } from 'preact-router'
import style from './style.sass'

import { apiRequest } from '../../util'
import Loader from '../../components/loader/'

class Scoreboard extends Component {
    state = { page: 0, standings: null }

    componentDidMount() {
        this.loadPage(0)
    }

    loadPage = (page) => {
        apiRequest('/scoreboard?page=' + page)
            .then(r => this.setState({
                offset: r.offset,
                standings: r.standings,
                numPages: r.numPages,
                page: r.page
            }))
    }

    formatStandings = (standings, offset) => {
        return (
            <table>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Last Solve</th>
                </tr>
            {standings.map(({ username, points, lastSolve }, i) => 
                <tr>
                    <td>{offset + i + 1}</td>
                    <td><Link href={'/profile/' + username}>{username}</Link></td>
                    <td>{points}</td>
                    <td>{lastSolve ? new Date(lastSolve).toLocaleString() : '-'}</td>
                </tr>
            )}
            </table>
        )
    }

    formatPagination = (page, numPages) => {
        return (
            <div class={style.pagination_container}>
                {Array(numPages).fill(0).map((_, i) =>
                    <a onClick={this.loadPage.bind(null, i)} class={i == page ? style.current_page : style.page_button}>{i+1}</a>
                )}
            </div>
        )
    }

    render(_, { standings, offset, page, numPages }) {
        console.log(standings, offset)
        if(!standings) return <Loader />
        return (
            <div class={style.scoreboard}>
                <h1>Scoreboard</h1>
                {this.formatStandings(standings, offset)}
                {this.formatPagination(page, numPages)}
            </div>
        )
    }
}

export default Scoreboard
