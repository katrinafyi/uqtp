import React from "react"
import { useStoreState } from "../state/persistState";

const UserInfoView = () => {
  const user = useStoreState(s => s.user);
  const state = useStoreState(s => s);

  if (!user) {
    console.warn("Attempting to render UserInfoView with no user set.");
    return <></>;
  }

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
      <label className="label">Raw Timetable Data</label>
      <input type="text" className="input is-small" value={JSON.stringify(state)} readOnly/>
    </div>
    {/* {firebaseUI && <div className="field">
      <label className="label">Link Accounts</label>
      <div className="control">{firebaseUI}</div>
    </div>} */}
  </>;
};

export default UserInfoView;