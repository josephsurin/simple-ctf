import { h } from 'preact'
import { Link } from 'preact-router/match'
import style from './style.sass'

const Header = ({ paths }) => (
	<header class={style.header}>
		<nav>
            {paths.map(({ path, name }) => 
                <Link activeClassName={style.active} href={path}>{name}</Link>
            )}
		</nav>
	</header>
)

export default Header
