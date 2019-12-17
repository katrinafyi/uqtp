import React, { useState, ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { FaSave, FaPencilAlt, FaCopy, FaTimes } from "react-icons/fa";

export type TimetableSelectorProps = {
    timetableNames: string[],
    current: string
}

export const TimetableSelector = ({ timetableNames, current }: TimetableSelectorProps) => {
    const savedValid = timetableNames.indexOf(current) !== -1;

    const [isRenaming, setIsRenaming] = useState(false);

    const makeTag = (x: string) => <div className="control"><div key={x} className="buttons has-addons">
        <button className="button is-normal is-link">{x}</button>
        <button className="button is-normal is-light"><FaTimes></FaTimes></button>
    </div></div>;

    const onClickRename = (ev: React.MouseEvent<HTMLElement>) => {
        if (isRenaming) {
            console.log('clicked while renaming');
            
        } else {
            console.log('entering renaming mode');
            setIsRenaming(true);
        }
        ev.stopPropagation();
        ev.preventDefault();            
    }

    return <form className="form">
        <div className={"field has-addons "}>
            <div className="control">
                <input type="text" className="input is-medium " value={current}/>
            </div>
            <div className="control">
                <button className="button is-medium is-success" type="submit" onClick={onClickRename}><FaPencilAlt></FaPencilAlt></button>
            </div>
            <div className="control">
                <button className="button is-medium  is-link"><FaCopy></FaCopy></button>
            </div>
        </div>

        <div className="field is-grouped is-grouped-multiline">
            {makeTag("new timetable")}
            {timetableNames.map(makeTag)}
        </div>
        {!savedValid && <div className="message is-danger">
            <div className="message-body">
                <strong>Error:</strong> The selected timetable "{current}" could not be loaded.
            </div>
        </div>}
    </form>;
}

export default TimetableSelector;