import { AssignmentStudentQuestion } from "./assignment-student-question";

export class AssignmentStudent {
    docNumber: any;
    date: any;
    notes: any;
    employeeName: any;
    studentName: any;
    constructor(
        public id: number = 0,
        public degree: number | null = null,
        public studentClassroomID: number = 0,
        public classroomID: number = 0,
        public studentID: number = 0,
        public classroomName: string = '',
        public studentEnglishName: string = '',
        public studentArabicName: string = '',
        public linkFile: string = '',
        public file: File | null = null,
        public assignmentID: number = 0,
        public assignmentEnglishName: string = '',
        public assignmentArabicName: string = '',
        public subjectId: number = 0,
        public subjectName: string = '',
        public mark: number | null = null,
        public assignmentDegree: number = 0,
        public assignmentTypeID: number = 0,
        public openDate: string = '',
        public dueDate: string = '',
        public cutOfDate: string = '',
        public insertedByUserName: string = '',
        public isVisibleToStudent: boolean = false,
        public evaluationConsideringTheDelay: boolean = false,
        public assignmentStudentQuestions: AssignmentStudentQuestion[] = [],
        public insertedAt :string ='',

    ) { }
}


