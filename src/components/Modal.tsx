import React, { ReactNode } from "react"

type Props = {
    visible: boolean,
    setVisible: (visible: boolean) => any,
    narrow?: boolean,

    title?: ReactNode,
    children?: ReactNode,
    footer?: ReactNode,
}

export const ModalCard = ({ visible, setVisible, title, children, footer }: Props) => {
    const hideModal = () => setVisible(false);

    return <div className={"modal " + (visible ? 'is-active' : '')}>
        <div className="modal-background" onClick={hideModal}></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">{title}</p>
                <button className="delete" aria-label="close" type="button" onClick={hideModal}></button>
            </header>
            <section className="modal-card-body">
                {children}
            </section>
            <footer className="modal-card-foot">
                {footer}
            </footer>
        </div>
    </div>;
}

export const Modal = ({ visible, setVisible, narrow, children }: Props) => {
    const hideModal = () => setVisible(false);

    const style = (narrow ?? false) ? { width: 'fit-content' } : undefined;

    return <div className={"modal " + (visible ? 'is-active' : '')}>
        <div className="modal-background" onClick={hideModal}></div>
        <div className="modal-content"  style={style}>
            {children}
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={hideModal}></button>
    </div>;
}