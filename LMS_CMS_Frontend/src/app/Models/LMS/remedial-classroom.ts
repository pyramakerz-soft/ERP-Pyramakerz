export class RemedialClassroom {
    constructor(
        public id: number = 0,
        public name: string = '',
        public schoolID: number = 0,
        public schoolName: string = '',
        public academicYearID: number = 0,
        public academicYearName: string = '',
        public teacherID: number = 0,
        public teacherName: string = '',
        public subjectID: number = 0,
        public subjectName: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',

        public StudentsId: number[] = [],
        public insertedAt: string = '',
        public insertedByUserId: number = 0,
    ) { }
}
