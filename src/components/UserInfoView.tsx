import React, { useMemo } from "react"
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../state/firebase";

const UserInfoView = () => {
  const [authUser] = useAuthState(auth);

  const user = useMemo(() => {
    if (!authUser) return;
    return {
      uid: authUser.uid,
      name: authUser.displayName,
      email: authUser.email,
      photo: authUser.photoURL,
      phone: authUser.phoneNumber,
      providers: authUser.providerData?.map(x => x?.providerId ?? JSON.stringify(x)),
      isAnon: authUser.isAnonymous,
    }
  }, [authUser]);

  // useEffect(() => {
  //   if (!authUser) return;
  //   setUser(authUser);
  // }, [setUser, authUser]);

  if (!user) {
    // console.warn("Attempting to render UserInfoView with no user set.");
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
    {/* <div className="field">
      <label className="label">Raw Timetable Data</label>
      <input type="text" className="input is-small" value={JSON.stringify(state)} readOnly/>
    </div> */}
    {/* {firebaseUI && <div className="field">
      <label className="label">Link Accounts</label>
      <div className="control">{firebaseUI}</div>
    </div>} */}
  </>;
};

export default UserInfoView;