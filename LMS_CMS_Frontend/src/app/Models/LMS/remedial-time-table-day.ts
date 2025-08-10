import { RemedialTimeTableClasses } from "./remedial-time-table-classes";

export class RemedialTimeTableDay {
    constructor(
        public id: number=0,
        public periodIndex: number=0,
        public dayId: number=0,
        public dayName: string='',
        public remedialTimeTableClasses : RemedialTimeTableClasses[] =[]
    ) { }
}

