import React from "react"

interface Props {
}

const TimeColumn: React.FC<Props> = () => {
    return <table className="table is-fullwidth">
        <thead>
            <tr><th className="has-text-centered">🕒</th></tr>
        </thead>
        <tbody>
            {Array.from(Array(15).keys())
                .map((i) => <tr><th className="has-text-centered">{i+8}</th></tr>)}
        </tbody>
    </table>;
}
export default TimeColumn;
