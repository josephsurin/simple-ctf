import { h, Component } from 'preact'
import { Router } from 'preact-router'

import { isLoggedIn } from '../util'

import Header from './header'
import Register from '../routes/register'
import Login from '../routes/login'
import Logout from '../routes/logout'
import NotFound from '../routes/notfound'

export default class App extends Component {
    constructor() {
        super()
        this.state = { currentUrl: '/' }
        this.loggedOutPaths = [
            { path: '/', name: 'Home' },
            { path: '/about', name: 'About' },
            { path: '/register', name: 'Register' },
            { path: '/login', name: 'Login' }
        ]

        this.loggedInPaths = [
            { path: '/', name: 'Home' },
            { path: '/challenges', name: 'Challenges' },
            { path: '/profile', name: 'Profile' },
            { path: '/logout', name: 'Logout' }
        ]
    }

	handleRoute = e => {
        setTimeout(() => {
            this.setState({ currentUrl: e.url })
        }, 0)
	}

	render() {
        var paths = isLoggedIn() ? this.loggedInPaths : this.loggedOutPaths
		return (
			<div id="app">
				<Header paths={paths}/>
				<Router onChange={this.handleRoute}>
                    <Register path="/register/" />
                    <Login path="/login/" />
                    <Logout path="/logout" />
                    <NotFound default />
				</Router>
			</div>
		)
	}
}
