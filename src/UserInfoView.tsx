import React from "react"
import { PersistState } from "./state/schema";
import { connect } from "react-redux";

type Props = ReturnType<typeof mapStateToProps> & {
  firebaseUI?: JSX.Element
};

const _UserInfoView = ({ user, state, firebaseUI }: Props) => {
  if (!user)
    return <></>;
  return <>
    <div className="field">
      <label className="label">User ID</label>
      <div className="control">
        <input type="text" className="input is-family-monospace is-small" value={user.uid} readOnly/>
      </div>
    </div>
    <div className="field">
      <label className="label">Auth Providers</label>
      <input type="text" className="input is-small" value={user.providers ? user.providers.join(' ') : '(none)'} readOnly/>
    </div>
    <div className="field">
      <label className="label">User Data Object</label>
      <div className="control">
        <input type="text" className="input is-small" value={JSON.stringify(user)} readOnly/>
      </div>
    </div>
    <div className="field">
      <label className="label">Export Timetable Data</label>
      <input type="text" className="input is-small" value={JSON.stringify(state)} readOnly/>
    </div>
    {/* {firebaseUI && <div className="field">
      <label className="label">Link Accounts</label>
      <div className="control">{firebaseUI}</div>
    </div>} */}
  </>;
};

const mapStateToProps = (state: PersistState) => ({
  user: state.user,
  state: state,
})

export const UserInfoView = connect(mapStateToProps)(_UserInfoView);