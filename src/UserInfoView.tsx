import React from "react"
import { PersistState } from "./state/schema";
import { connect } from "react-redux";

type Props = ReturnType<typeof mapStateToProps>;

const _UserInfoView = ({ user }: Props) => {
  if (!user)
    return <></>;
  return <>
    <div className="field">
      <label className="label">User ID</label>
      <div className="control">
        <input type="text" className="input is-family-monospace" value={user.uid} readOnly/>
      </div>
    </div>
    <div className="field">
      <label className="label">Auth Providers</label>
      <input type="text" className="input" value={user.providers ? user.providers.join(' ') : ''} readOnly/>
    </div>
  </>;
};

const mapStateToProps = (state: PersistState) => ({
  user: state.user
})

export const UserInfoView = connect(mapStateToProps)(_UserInfoView);