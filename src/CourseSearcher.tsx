import React, { useState, Dispatch } from "react";
import { FaSearch } from "react-icons/fa";
import { searchCourses, FullSearchResult, CourseSearchResult } from "./logic/api";
import _ from "lodash";
import { connect } from "react-redux";
import { RootAction } from "./state/store";
import { setAllSessions } from "./state/ducks/timetables";

type SearchResultProps = {
    result: CourseSearchResult, 
    dispatch: Dispatch<RootAction>
}

const _SearchResult = ({ result, dispatch }: SearchResultProps) => {
    return (
    <div className="column is-narrow">
        <button className="button button-card" title={`Click to add ${result.course} to the current timetable`}
                onClick={() => (dispatch(setAllSessions(result.activities)))}>
            <div>
                <h6 className="title is-6 mb-2">
                    {result.course}
                </h6>
                <p className="mb-1">{result.name}</p>
                <p><small>{result.coordinator}</small></p>
                <p className="mt-2">{result.semester}</p>
            </div>
        </button>
    </div>);
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => {
    return {dispatch};
}

export const SearchResult = connect(undefined, mapDispatchToProps)(_SearchResult);


export const compareSemesters = (a: CourseSearchResult, b: CourseSearchResult) => {
    let x = a.semester.localeCompare(b.semester);
    if (x !== 0) return x;
    x = a.course.localeCompare(b.course);
    return x;
}


type SearchState = 'loading' | 'error' | 'done';

export const CourseSearcher = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState<SearchState>('done');
    const [results, setResults] = useState<FullSearchResult | null>(null);

    const search = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation();
        ev.preventDefault();

        if (loading !== 'done')
            return;

        setLoading('loading');

        searchCourses(query)
        .then((data) => {
            setLoading('done');
            setResults(data);
        })
        .catch(e => {
            console.error('error while searching courses', e);
            setLoading('error');
            setResults(null);
        });
    };

    const isLoading = loading === 'loading';
    const resultsEmpty = results != null && _.isEmpty(results);
    const resultsPresent = results != null && !_.isEmpty(results);
    const resultsError = loading === 'error';

    return <div className="">
        <form className="form mb-3">
            <div className="field has-addons">
                {/* <label htmlFor="" className="label">Search courses</label> */}
                <div className="control">
                    <input className="input" type="search" placeholder="MATH1051" style={{width: 'unset'}}
                        value={query} onChange={(e) => setQuery(e.target.value)}/>
                    {/* <span className="icon is-small is-left">
                        <FaSearch></FaSearch>
                    </span> */}
                </div>
                <div className="control">
                    <button className={"button is-info " + (isLoading ? 'is-loading' : '')} type="submit" onClick={search}>
                        <span className="icon"><FaSearch></FaSearch></span>
                    </button>
                </div>
            </div>
        </form>
        {resultsPresent && <>
            {/* <div className="has-text-weight-bold my-3">Results</div> */}
            <div className="columns is-multiline mb-2">
                {Object.values(results!).slice(0, 10).sort(compareSemesters)
                    .map(r => <SearchResult result={r} key={r.course}></SearchResult>)}
            </div>
        </>}
        {resultsEmpty && <div className="has-text-weight-bold mb-3 has-text-danger-dark">No results.</div>}
        {resultsError && <div className="has-text-weight-bold mb-3 has-text-danger-dark">Error while searching courses.</div>}
    </div>;
};

export default CourseSearcher;