export class RemedialTimeTableClasses {
    constructor(
        public id: number = 0,
        public remedialTimeTableDayId: number = 0,
        public remedialClassroomID: number = 0,
        public remedialClassroomName: string = '0',
        public gradeID: number = 0,
        public gradeName: string = '0',
        public subjectID: number = 0,
        public subjecEntName: string = '0',
        public subjectArName: string = '0',
        public academicYearID: number = 0,
        public academicYearName: string = '0',
        public teacherID: number = 0,
        public teacherEnName: string = '0',
        public teacherArName: string = '0',
        public remedialClassroomIds: number[] = []
    ) { }
}

