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
        <button className={"button  is-small " + (current === x ? 'is-link' : 'is-dark')}>{x}</button>
        <button className="button  is-small is-outlined"><FaTimes></FaTimes></button>
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
        <div className="field">
            <label className="label">Selected Timetable</label>
            <div className="control">
                <div className={"field has-addons "}>
                    <div className="control">
                        <input type="text" className="input  " value={current}/>
                    </div>
                    <div className="control">
                        <button className="button  is-success" type="submit" onClick={onClickRename}><FaPencilAlt></FaPencilAlt></button>
                    </div>
                    <div className="control">
                        <button className="button   is-link"><FaCopy></FaCopy></button>
                    </div>
                </div>
            </div>
        </div>
        <div className="field">
            <label className="label">Saved Timetables</label>
            <div className="control">
                <div className="field is-grouped is-grouped-multiline">
                    {makeTag("new timetable")}
                    {timetableNames.map(makeTag)}
                </div>
            </div>
        </div>

        
        {!savedValid && <div className="message is-danger">
            <div className="message-body">
                <strong>Error:</strong> The selected timetable "{current}" could not be loaded.
            </div>
        </div>}
    </form>;
}

export default TimetableSelector;