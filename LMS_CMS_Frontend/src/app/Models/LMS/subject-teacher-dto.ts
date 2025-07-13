export class SubjectTeacherDTO {
    constructor(
        public subjectId: number,
        public subjectName: string,
        public teacherId: number,
        public teacherName: string,
    ) { }
}
