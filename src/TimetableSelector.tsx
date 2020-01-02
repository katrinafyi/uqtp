import React, { useState, ButtonHTMLAttributes, DetailedHTMLProps, createRef } from "react"
import { FaSave, FaPencilAlt, FaCopy, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { css } from "emotion";

export type TimetableSelectorProps = {
    timetableNames: string[],
    current: string
}

const inputStyle = css({
    width: '100%',
    border: 'none !important',
    outline: 'none !important',
});

export const TimetableSelector = ({ timetableNames, current }: TimetableSelectorProps) => {
    const savedValid = timetableNames.indexOf(current) !== -1;
    
    const renameRef = createRef<HTMLInputElement>();
    const [isRenaming, setIsRenaming] = useState(false);
    const [invalidName, setInvalidName] = useState<string | null>(null);

    const makeTag = (x: string) => <div className="control" key={x}><div key={x} className="buttons has-addons">
        <button className={"button  is-small " + (current === x ? 'is-link' : 'is-dark')}>{x}</button>
        <button className="button  is-small is-outlined"><span className="icon"><FaTimes></FaTimes></span></button>
    </div></div>;

    const onClickRename = (ev: React.MouseEvent<HTMLElement>) => {
        if (isRenaming) {
            // console.log('clicked while renaming');
            const newName = renameRef.current!.value;
            if (newName !== current)
                setInvalidName(newName);
            else {
                setIsRenaming(false);
                setInvalidName(null);
            }
        } else {
            // console.log('entering renaming mode');
            renameRef.current!.focus();
            setIsRenaming(true);
        }
        ev.stopPropagation();
        ev.preventDefault();
    }

    return <form className="form">
        <div className="field">
            <div className="control">
                <input ref={renameRef} type="text" className={"title "+inputStyle} 
                    readOnly={!isRenaming} defaultValue={current}
                    placeholder="Enter timetable name"/>
            </div>
        </div>
        <div className="field is-grouped">
            <div className="control">
                <div className="buttons  has-addons">
                    <button className="button is-small is-success" type="submit" onClick={onClickRename}>
                        <span className="icon">{isRenaming ? <FaSave></FaSave> : <FaPencilAlt></FaPencilAlt>}</span>
                        <span>{isRenaming ? 'Save' : 'Rename'}</span>
                    </button>
                    {!isRenaming && <>
                    <button className="button is-small  is-info">
                        <span className="icon"><FaCopy></FaCopy></span><span> Duplicate</span>
                    </button>
                    <button className="button is-small  is-danger">
                        <span className="icon"><FaTrash></FaTrash></span><span> Delete</span>
                    </button>
                    </>}
                </div>
            </div>
            {!isRenaming && <div className="control">
                <button className="button is-small is-link">
                    <span className="icon"><FaPlus></FaPlus></span><span> New</span>
                </button>
            </div>}
            {invalidName !== null && <p className="help is-danger">Timetable "{invalidName}" already exists.</p>}
        </div>
        <div className="field">
            <label className="label">Saved Timetables</label>
            <div className="control">
                <div className="field is-grouped is-grouped-multiline">
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