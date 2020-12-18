import React from "react"

export const MyTimetableHelp = () => {
    return <>
        <ol style={{listStylePosition: 'inside'}}>
            <li>Go to the <a href="https://timetable.my.uq.edu.au/odd/timetable/#subjects" rel="noopener noreferrer" target="_blank">
                UQ Public Timetable</a>. Make sure the <>year and semester</> are correct.</li>
            <li>Search for courses you're interested in and select them in the left list.</li>
            <li>Click the Show Timetable button.</li>
            <li>Click the export button (next to print) and choose Excel.</li>
            <li>Import the downloaded Excel .xls file into UQTP using the button above.</li>
        </ol>
    </>
} 