import React from 'react';

export interface Props {

}

type State = {
    error: Error | null,
}

export default class StateErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null, }
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { error: error };
    }

    render() {
        if (this.state.error) {
            return <div className="section"><div className="is-danger message">
                <div className="message-header"><p>Error</p></div>
                <div className="message-body">
                    <p>An error occured while rendering the view ({this.state.error.toString()}).</p>
                    <p>Check the browser console for more details. Report bugs to <a href="mailto:k@rina.fyi">k@rina.fyi</a>.</p>
                </div>
            </div></div>;
        } else {
            return this.props.children;
        }
    }
}
