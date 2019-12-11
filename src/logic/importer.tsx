import XLSX from 'xlsx';
import _ from 'lodash';
import { CourseSession, DayOfWeek } from './types';
import parse from 'date-fns/parse'
import { minTime } from 'date-fns';

export const parseExcelFile = (file: Blob) => {
    const f = new FileReader();
    
    return new Promise<string[][]>((resolve, reject) => {
        f.onload = () => {
            //console.log(f.result);
            const arr = new Uint8Array(f.result as ArrayBuffer);
            const a = XLSX.read(arr, {type: 'array'});
            const sheet = a.SheetNames[0];
            //console.log(a);
            //debugger;
            resolve(XLSX.utils.sheet_to_json(a.Sheets[sheet], {header: 1}));
        };

        f.onerror = (ev: ProgressEvent<FileReader>) => {
            f.abort();
            reject(new Error("error reading excel sheet."));
        }
        f.readAsArrayBuffer(file);
    })
};

const oldColumns = [
    'Subject Code', 'Description', 'Group', 'Activity', 'Day', 'Time', 'Campus', 'Location', 'Duration', 'Dates',
];

const newColumns = [
    'course', 'description', 'activity', 'group', 'day', 'time', 'campus', 'location', 'duration', 'dates',
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const parseSheetRows = (rows: string[][]) => {
    if (rows[0] && rows[0].length === 0)
        rows = rows.slice(1);
    if (rows.length === 0)
        return null;

    const expectedCols = 10;

    if (!rows.every((r) => r.length === expectedCols))
        return null;

    const headings = rows[0];
    if (!_.isEqual(headings, oldColumns))
        return null;

    const parseRow = (row: string[]) =>
        Object.fromEntries(row.map((x, i) => [newColumns[i], x]));

    const parseTime = (str: string) => {
        const t = parse(str, 'HH:mm', new Date());
        return {hour: t.getHours(), minute: t.getMinutes()};
    }

    const fixObject = (obj: {[key: string]: string}) => {
        return {
            ...obj,
            activityType: obj.activity.replace(/\d+$/, ''),
            duration: 60 * parseFloat(obj.duration.replace(/ hrs?$/, '')),
            day: days.indexOf(obj.day),
            time: parseTime(obj.time),
        } as CourseSession;
    };
    

    return rows.slice(1).map(parseRow).map(fixObject);
};

