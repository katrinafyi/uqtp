import React, { useState, createRef } from "react"
import { FaSave, FaPencilAlt, FaCopy, FaPlus, FaTrash } from "react-icons/fa";
import { css } from "emotion";
import { PersistStateAction } from "./state/ducks/persist";
import { Timetable, TimetablesState } from "./state/types";
import _ from "lodash";

export type TimetableSelectorProps = {
    timetables: TimetablesState,
    current: string,
    dispatch: (action: PersistStateAction) => any
}

const inputStyle = css({
    width: '100%',
    border: 'none !important',
    outline: 'none !important',
    lineHeight: 1,
});

export const TimetableSelector = ({ timetables, current, dispatch }: TimetableSelectorProps) => {
    const savedValid = !!timetables[current];
    
    const renameRef = createRef<HTMLInputElement>();
    const [isRenaming, setIsRenaming] = useState(false);
    const currentName = timetables[current].name;
    const [name, setName] = useState<string>(currentName);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const onClickTag = (ev: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({type: 'selectTimetable', id: (ev.target as HTMLButtonElement).value});
    }

    const makeTag = ([id, timetable]: [string, Timetable]) => 
    <div className="control" key={id}><div key={id} className="buttons has-addons">
        <button className={"button  is-small " + (current === id ? 'is-link' : 'is-dark')}
            value={id} onClick={onClickTag} type="button">{timetable.name}</button>
        {/* <button className="button  is-small is-outlined"><span className="icon"><FaTimes></FaTimes></span></button> */}
    </div></div>;

    const onClickRename = (ev: React.MouseEvent<HTMLElement>) => {
        if (isRenaming) {
            // console.log('clicked while renaming');
            dispatch({type: 'renameTimetable', id: current, new: name});
            setIsRenaming(false);
        } else {
            // console.log('entering renaming mode');
            setName(currentName);
            renameRef.current!.focus();
            setIsRenaming(true);
        }
        ev.stopPropagation();
        ev.preventDefault();
    }

    const onClickDuplicate = (ev: React.MouseEvent<HTMLElement>) => {
        dispatch({type: 'copyTimetable', id: current});
    }

    const onClickDelete = (ev: React.MouseEvent<HTMLElement>) => {
        if (confirmDelete) {
            dispatch({type: 'deleteTimetable', id: current});
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
        }
    }

    const onClickNew = (ev: React.MouseEvent<HTMLElement>) => {
        dispatch({type: 'newTimetable'});
    }

    const onClickCancel = () => {
        setConfirmDelete(false);
    }

    return <form className="form">
        <div className="field">
            <div className="control">
                <input ref={renameRef} type="text" className={"title "+inputStyle} 
                    readOnly={!isRenaming} value={isRenaming ? name : currentName} 
                    onChange={(ev) => setName(ev.target.value)}
                    placeholder="timetable name…"/>
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
                    <button className="button is-small  is-info" type="button" onClick={onClickDuplicate}>
                        <span className="icon"><FaCopy></FaCopy></span><span> Duplicate</span>
                    </button>
                    <button className="button is-small  is-danger" type="button" onClick={onClickDelete}>
                        <span className="icon"><FaTrash></FaTrash></span><span> Delete</span>
                    </button>
                    </>}
                </div>
            </div>
            {!isRenaming && <div className="control">
                <button className="button is-small is-link" type="button" onClick={onClickNew}>
                    <span className="icon"><FaPlus></FaPlus></span><span> New</span>
                </button>
            </div>}
            {/* {name !== null && <p className="help is-danger">Timetable "{name}" already exists.</p>} */}
        </div>
        <div className="field">
            <label className="label">Saved Timetables</label>
            <div className="control">
                <div className="field is-grouped is-grouped-multiline">
                    {_.sortBy(Object.entries(timetables), ([k,v]) => v.name).map(makeTag)}
                </div>
            </div>
        </div>
        
        {!savedValid && <div className="message is-danger">
            <div className="message-body">
                <strong>Error:</strong> The selected timetable "{currentName}" could not be loaded.
            </div>
        </div>}
        
        <div className={"modal " + (confirmDelete ? 'is-active' : '')}>
            <div className="modal-background" onClick={onClickCancel}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Delete timetable?</p>
                    <button className="delete" aria-label="close" type="button" onClick={onClickCancel}></button>
                </header>
                <section className="modal-card-body">
                    Are you sure you want to delete "{currentName}"?
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-danger" type="button" onClick={onClickDelete}>
                        <span className="icon"><FaTrash></FaTrash></span><span> Delete</span>
                    </button>
                    <button className="button" type="button" onClick={onClickCancel}>Cancel</button>
                </footer>
            </div>
        </div>
    </form>;
}

export default TimetableSelector;