import React, { useState, memo } from "react";
import { FaSearch } from "react-icons/fa";
import { searchCourses, FullSearchResult, CourseSearchResult, compareSearchResultSemesters } from "../logic/api";
import _ from "lodash";
import { useStoreActions } from "../state/persistState";

export const SearchResult = (props: { result: CourseSearchResult }) => {
  const updateSessions = useStoreActions(s => s.updateCourseSessions);

  const result = props.result;

  return (
    <div className="column is-narrow">
      <button className="button button-card" title={`Click to add ${result.course} to your timetable`}
        onClick={() => updateSessions(result.activities)}>
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

enum SearchState {
  LOADING, ERROR, DONE,
}

export const CourseSearcher = memo(() => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState<SearchState>(SearchState.DONE);
  const [results, setResults] = useState<FullSearchResult | null>(null);

  const search = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (loading !== SearchState.DONE)
      return;

    setLoading(SearchState.LOADING);

    try {
      const results = await searchCourses(query);
      setLoading(SearchState.DONE);
      setResults(results);
    } catch (e) {
      console.error('error while searching courses', e);
      setLoading(SearchState.ERROR);
      setResults(null);
    }
  };

  const isDone = loading === SearchState.DONE;
  const isLoading = loading === SearchState.LOADING;
  const isError = loading === SearchState.ERROR;
  const resultsEmpty = results != null && _.isEmpty(results);
  const resultsPresent = results != null && !_.isEmpty(results);

  return <>
    <p className="mb-3">
      <i>Updated for 2022!</i>
    </p>

    <form className="form mb-3">
      <div className="field has-addons">

        <div className="control">
          <input className="input" type="search" placeholder="ABCD1234" style={{ width: 'unset' }}
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="control">
          <button className={"button is-link " + (isLoading ? 'is-loading' : '')} type="submit" onClick={search}>
            <span className="icon"><FaSearch></FaSearch></span>
          </button>
        </div>

      </div>
    </form>

    {resultsPresent && <>
      {/* <div className="has-text-weight-bold my-3">Results</div> */}
      <div className="columns is-multiline mb-2">
        {Object.values(results!).slice(0, 20).sort(compareSearchResultSemesters)
          .map(r => <SearchResult result={r} key={r.course}></SearchResult>)}
      </div>
    </>}

    {resultsEmpty && <div className="has-text-weight-bold mb-3 has-text-danger-dark">No results.</div>}
    {isError && <div className="has-text-weight-bold mb-3 has-text-danger-dark">Error while searching courses.</div>}

    {isDone && results == null && <div className="mb-3">
      Search for your courses here. You can also include the semester or delivery mode, e.g. &ldquo;MATH1051 S2 EX&rdquo;.
    </div>}
  </>;
});

export default CourseSearcher;