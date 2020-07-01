import React from "react";
import { FaSearch } from "react-icons/fa";

export const CourseSearcher = () => {
    return <form className="form">
        <div className="field has-addons">
            <label htmlFor="" className="label">Search courses</label>
            <div className="control">
                <input className="input" type="search" placeholder="MATH1051" style={{width: 'unset'}}/>
                {/* <span className="icon is-small is-left">
                    <FaSearch></FaSearch>
                </span> */}
            </div>
            <div className="control">
                <button className="button is-info">
                    <span className="icon"><FaSearch></FaSearch></span>
                </button>
            </div>
        </div>
    </form>;
}

export default CourseSearcher;