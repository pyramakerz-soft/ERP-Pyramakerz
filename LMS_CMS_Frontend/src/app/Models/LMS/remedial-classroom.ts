import { RemedialClassroomStudent } from "./remedial-classroom-student";

export class RemedialClassroom {
    constructor(
        public id: number = 0,
        public name: string = '',
        public numberOfSession: number = 0,
        public schoolID: number = 0,
        public schoolName: string = '',
        public academicYearID: number = 0,
        public academicYearName: string = '',
        public teacherID: number = 0,
        public teacherName: string = '',
        public subjectID: number = 0,
        public subjectArabicName: string = '',
        public subjectEnglishName: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',
        public studentIds: number[] = [],
        public remedialClassroomStudents: RemedialClassroomStudent[] = [],
        public insertedAt: string = '',
        public insertedByUserId: number = 0,
    ) { }
}
