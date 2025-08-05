export class RemedialTimeTableClasses {
    constructor(
        public id: number = 0,
        public remedialTimeTableDayId: number = 0,
        public remedialClassroomID: number = 0,
        public remedialClassroomName: string = '0',
        public gradeID: number = 0,
        public gradeName: string = '0',
        public remedialClassroomIds: number[] = []
    ) { }
}

