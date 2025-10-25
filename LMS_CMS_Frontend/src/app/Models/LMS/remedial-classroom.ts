import { RemedialClassroomStudent } from "./remedial-classroom-student";

export class RemedialClassroom {
    constructor(
        public id: number = 0,
        public name: string = '',
        public numberOfSession: number | null= null,
        public schoolID: number = 0,
        public schoolName: string = '',
        public academicYearID: number = 0,
        public academicYearName: string = '',
        public teacherID: number = 0,
        public teacherEnName: string = '0',
        public teacherArName: string = '0',
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
