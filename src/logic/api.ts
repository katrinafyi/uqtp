import { CourseEvent } from "../state/types";

const ENDPOINT = 'https://asia-northeast1-uq-toilet-paper.cloudfunctions.net/proxy/even/rest/timetable/subjects';

export const fetchCourseData = async (query: string) =>
  fetch(ENDPOINT, {
    "headers": {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    "body": `search-term=${encodeURIComponent(query)}&semester=ALL&campus=ALL&faculty=ALL&type=ALL&days=1&days=2&days=3&days=4&days=5&days=6&days=0&start-time=00%3A00&end-time=23%3A00`,
    "method": "POST"
  }).then(x => x.json());

export type CourseSearchResult = {
  course: string,
  semester: string,
  coordinator: string,
  name: string,

  activities: CourseEvent[]
}

export type FullSearchResult = {
  [course: string]: CourseSearchResult
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const mappings = {
  course: 'subject_code',
  activity: 'activity_group_code',
  activityType: (data: any) => data.activity_group_code.replace(/\d+$/, ''),
  group: 'activity_code',
  description: 'description',
  dates: () => 'invalid date',
  day: (data: any) => days.indexOf(data.day_of_week),
  time: (data: any) => {
    const timeSplit = data.start_time.split(':')
      .map((x: string) => parseInt(x));
    return {hour: timeSplit[0], minute: timeSplit[1]};
  },
  campus: 'campus',
  location: 'location',
  duration: (data: any) => parseFloat(data.duration),
};

const convertActivity = (data: any): CourseEvent => {
  const event: any = {};
  for (const [to, from] of Object.entries(mappings)) {
    event[to] = typeof from == 'string' ? data[from] : from(data);
  }
  return event;
}

export const searchCourses = async (query: string): Promise<FullSearchResult> => {
  const response: {[c: string]: any} = await fetchCourseData(query);
  for (const [course, data] of Object.entries(response)) {
    data.course = course;
    data.name = data.description;
    data.coordinator = data.manager;
    data.activities = Object.values(data.activities).map(convertActivity);
  }
  return response;
};