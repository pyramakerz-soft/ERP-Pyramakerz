import { RemedialTimeTableDay } from "./remedial-time-table-day";

export class GroupRemedialTimeTableDay {
    constructor(
        public dayId: number=0,
        public dayName: string='',
        public periods: RemedialTimeTableDay[]=[],
    ) { }
}
