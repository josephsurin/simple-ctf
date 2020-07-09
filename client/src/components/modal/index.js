import { h } from 'preact'
import { useEffect } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import style from './style.sass'

const Modal = ({ open, onDismiss, children }) => {
    useEffect(() => {
        function listener(e) {
            if(e.key == 'Escape') onDismiss()
        }
        if(open) {
            document.addEventListener('keyup', listener)
            return () => document.removeEventListener('keyup', listener)
        }
    }, [open, onDismiss])

    return open &&
        createPortal((
        <div class={style.modal} style={{ display: open ? 'block' : 'none' }}>
            <div class={style.backdrop} onClick={onDismiss} />
            <div class={style.inner}>
                {children}
            </div>
        </div>), document.body)
}

export default Modal
