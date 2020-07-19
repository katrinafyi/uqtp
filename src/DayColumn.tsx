import React from "react"
import TimeColumn from "./TimeColumn"

interface Props {
}

const DayColumn: React.FC<Props> = () => {
    return <div className="columns is-mobile is-gapless">
        <div className="column is-2 is-hidden-tablet">
            <TimeColumn></TimeColumn>
        </div>
        <div className="column">
            <table className="table is-fullwidth">
                <thead>
                    <tr><th>Monday</th></tr>
                </thead>
                <tbody>
                    {Array.from(Array(15).keys()).map((i) => <tr><td>{"Course " + i}</td></tr>)}
                </tbody>
            </table>
        </div>
    </div>
}
export default DayColumn;
