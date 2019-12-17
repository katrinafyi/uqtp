import React, { useState, ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { FaSave, FaPencilAlt, FaCopy } from "react-icons/fa";

export type TimetableSelectorProps = {
    timetableNames: string[],
    current: string
}

export const TimetableSelector = ({ timetableNames, current }: TimetableSelectorProps) => {
    const savedValid = timetableNames.indexOf(current) !== -1;

    const [isRenaming, setIsRenaming] = useState(false);

    const makeTag = (x: string) => <><div key={x} className="tags has-addons are-medium">
        <span className="is-link tag is-clickable">{x}</span> <span className="tag is-delete is-clickable"></span>
    </div></>;

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
        <div className={"field has-addons"}>
            <div className="control">
                <input type="text" className="input" value={current}/>
            </div>
            <div className="control">
                <button className="button is-success" type="submit" onClick={onClickRename}><FaPencilAlt></FaPencilAlt></button>
            </div>
            <div className="control">
                <button className="button is-link"><FaCopy></FaCopy></button>
            </div>
        </div>

        <div className="tags are-medium">
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