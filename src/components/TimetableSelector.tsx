import React, { useState, createRef, useEffect } from "react"
import { FaSave, FaPencilAlt, FaCopy, FaPlus, FaTrash } from "react-icons/fa";
import { PersistStateAction } from "../state/ducks/persist";
import { Timetable, TimetablesState } from "../state/types";
import _ from "lodash";
import { useStoreState, useTimetableActions } from "../state/easy-peasy";

export type TimetableSelectorProps = {
  timetables: TimetablesState,
  current: string,
  dispatch: (action: PersistStateAction) => any
}

type TimetableTagProps = {
  id: string,
  timetable: Timetable,
  current: string,
  onClick: (ev: React.MouseEvent<HTMLButtonElement>) => any,
}

const TimetableTag = (props: TimetableTagProps) =>
  <div className="control" key={props.id}>
    <div className="buttons has-addons">
      <button className={"button is-small " + (props.current === props.id ? 'is-link' : 'is-dark')}
          value={props.id} onClick={props.onClick} type="button">
        {props.timetable.name}
      </button>
      {/* <button className="button  is-small is-outlined"><span className="icon"><FaTimes></FaTimes></span></button> */}
    </div>
  </div>;

export const TimetableSelector = () => {
  const timetables = useStoreState(s => s.timetables);
  const current = useStoreState(s => s.current);
  const { select, new: new_, copy, delete: delete_, rename } = useTimetableActions();

  const savedValid = !!timetables[current];

  const renameRef = createRef<HTMLInputElement>();
  const [isRenaming, setIsRenaming] = useState(false);
  const currentName = timetables?.[current]?.name ?? 'invalid timetable name';
  const [name, setName] = useState<string>(currentName);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isRenaming) setName(currentName);
  }, [isRenaming, currentName]);

  const onClickTag = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setIsRenaming(false);
    select((ev.target as HTMLButtonElement).value);
  };

  const onClickRename = (ev: React.MouseEvent<HTMLElement>) => {
    if (isRenaming) {
      // console.log('clicked while renaming');
      rename(name);
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

  const onClickNew = () => new_();

  const onClickDuplicate = () => copy();

  const onClickDelete = (ev: React.MouseEvent<HTMLElement>) => {
    if (confirmDelete) {
      delete_(current);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  }


  const onClickCancel = () => {
    setConfirmDelete(false);
  }

  return <form className="form">
    <div className="field">
      <div className="control">
        <input ref={renameRef} type="text" className={"title"}
          value={isRenaming ? name : currentName}
          onChange={(ev) => isRenaming && setName(ev.target.value)}
          placeholder="timetable name…"
          readOnly={!isRenaming}
          style={{ width: '100%', border: 'none', outline: 'none', lineHeight: 1 }} />
      </div>
    </div>
    <div className="field is-grouped is-grouped-multiline">
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
          {_.sortBy(Object.entries(timetables), ([k, v]) => v.name).map(
            ([id, t]) => <TimetableTag id={id} current={current} timetable={t} onClick={onClickTag} key={id}></TimetableTag>
          )}
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