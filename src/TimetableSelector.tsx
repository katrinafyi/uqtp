import React, { useState, ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { FaSave, FaPencilAlt, FaCopy, FaTimes, FaPlus } from "react-icons/fa";

export type TimetableSelectorProps = {
    timetableNames: string[],
    current: string
}

export const TimetableSelector = ({ timetableNames, current }: TimetableSelectorProps) => {
    const savedValid = timetableNames.indexOf(current) !== -1;

    const [isRenaming, setIsRenaming] = useState(false);

    const makeTag = (x: string) => <div className="control" key={x}><div key={x} className="buttons has-addons">
        <button className={"button  is-small " + (current === x ? 'is-link' : 'is-dark')}>{x}</button>
        <button className="button  is-small is-outlined"><span className="icon"><FaTimes></FaTimes></span></button>
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
                        <input type="text" className="input  " defaultValue={current}/>
                    </div>
                    <div className="control">
                        <button className="button  is-success" type="submit" onClick={onClickRename}><span className="icon"><FaPencilAlt></FaPencilAlt></span></button>
                    </div>
                    <div className="control">
                        <button className="button   is-link"><span className="icon"><FaCopy></FaCopy></span></button>
                    </div>
                </div>
            </div>
        </div>
        <div className="field">
            <label className="label">Saved Timetables</label>
            <div className="control">
                <div className="field is-grouped is-grouped-multiline">
                    <div className="control">
                        <button className="button is-link is-small"><span className="icon"><FaPlus></FaPlus></span></button>
                    </div>
                        
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