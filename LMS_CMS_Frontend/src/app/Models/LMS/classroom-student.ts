import { StudentClassroomSubject } from "./student-classroom-subject";

export class ClassroomStudent {
    constructor(
        public id: number = 0,
        public studentID: number = 0,
        public studentEnglishName: string = '',
        public studentArabicName: string = '',
        public classID: number = 0,
        public className: string = '',
        public insertedByUserId: number = 0,
        public studentClassroomSubjects: StudentClassroomSubject[] = [],
        public studentIDs: number[] = []
    ) {}
}
