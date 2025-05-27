import { ClassroomSubjectCoTeacher } from "./classroom-subject-co-teacher";

export class ClassroomSubject {
    constructor(
        public id: number = 0,
        public hide: boolean = false,
        public teacherID: number = 0,
        public teacherEnglishName: string = '',
        public teacherArabicName: string = '',
        public subjectID: number = 0,
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '', 
        public classroomID: number = 0,
        public insertedByUserId: number = 0,
        public coTeacherIDs :number[] = [],
        public classroomSubjectCoTeachers :ClassroomSubjectCoTeacher[] = [],
    ) {}
} 