import { h, Component } from 'preact'
import LoaderSVG from './loader.svg'
 
const style = {
    width: '60px',
    height: '60px',
    marginLeft: '50%',
    transform: 'translateX(-50%)',
    marginTop: '10%'
}
const Loader = () => {
    return (
        <img src={LoaderSVG} alt="Loading..." style={style} />
    )
}

export default Loader
