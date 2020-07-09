import { h, Component } from 'preact'
import style from './style.sass'
import markdownit from 'markdown-it'
import config from '../../../config'
const { homePage } = config

const md = markdownit({ html: true })

const Home = () => (
    <div class={style.home}>
        <div dangerouslySetInnerHTML={{ __html: md.render(homePage) }}></div>
    </div>
)

export default Home
