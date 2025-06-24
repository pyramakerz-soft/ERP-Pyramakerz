import { AssignmentStudentQuestion } from "./assignment-student-question";

export class AssignmentStudent {
docNumber: any;
date: any;
notes: any;
employeeName: any;
studentName: any;
    constructor(
        public id: number = 0,
        public degree: number = 0,
        public studentClassroomID: number = 0,
        public classroomID: number = 0,
        public studentID: number = 0,
        public classroomName: string = '',
        public studentEnglishName: string = '',
        public studentArabicName: string = '',
        public linkFile: string = '',
        public file: File|null = null,
        public assignmentID: number = 0,
        public assignmentDegree: number = 0,
        public assignmentTypeID: number = 0 ,
        public assignmentStudentQuestions: AssignmentStudentQuestion[] = []
    ) {}
}


 