import { h, Component } from 'preact'
import { Router } from 'preact-router'

import { isLoggedIn } from '../util'

import Header from './header'
import Home from '../routes/home'
import Register from '../routes/register'
import Login from '../routes/login'
import Logout from '../routes/logout'
import Challenges from '../routes/challenges'
import Profile from '../routes/profile'
import Scoreboard from '../routes/scoreboard'
import NotFound from '../routes/notfound'

export default class App extends Component {
    constructor() {
        super()
        this.state = { currentUrl: '/' }
        this.loggedOutPaths = [
            { path: '/', name: 'Home' },
            { path: '/scoreboard', name: 'Scoreboard' },
            { path: '/register', name: 'Register' },
            { path: '/login', name: 'Login' }
        ]

        this.loggedInPaths = [
            { path: '/', name: 'Home' },
            { path: '/challenges', name: 'Challenges' },
            { path: '/scoreboard', name: 'Scoreboard' },
            { path: '/profile', name: 'Profile' },
            { path: '/logout', name: 'Logout' }
        ]
    }

	handleRoute = e => {
        this.setState({ currentUrl: e.url })
	}

	render() {
        var paths = isLoggedIn() ? this.loggedInPaths : this.loggedOutPaths
		return (
			<div id="app">
				<Header paths={paths}/>
				<Router onChange={this.handleRoute}>
                    <Home path="/" />
                    <Register path="/register" />
                    <Login path="/login" />
                    <Logout path="/logout" />
                    <Challenges path="/challenges" />
                    <Profile path="/profile/:username" />
                    <Profile path="/profile" />
                    <Scoreboard path="/scoreboard" />
                    <NotFound default />
				</Router>
			</div>
		)
	}
}
