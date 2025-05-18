import { InterviewTimeTable } from "./interview-time-table";

export class DayWithInterviews {
    constructor(
        public day: number = 0,
        public interviews: InterviewTimeTable[] = [],
    ){}
} 