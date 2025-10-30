import { AssignmentQuestion } from "./assignment-question";
import { AssignmentStudent } from "./assignment-student";

export class Assignment {
    constructor(
        public id: number = 0,
        public englishName: string = '',
        public arabicName: string = '',
        public mark: number | null = null,
        public passMark: number | null = null,
        public openDate: string = '',
        public dueDate: string | null = null,
        public cutOfDate: string = '',
        public isSpecificStudents: boolean = false,
        public isVisibleToStudent: boolean = false, 
        public linkFile: string = '',
        public fileFile: File | null = null,
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '',
        public subjectID: number = 0,
        public schoolName: string = '',
        public schoolID: number = 0,
        public gradeName: string = '',
        public gradeID: number = 0,
        public assignmentTypeID: number = 0,
        public assignmentTypeEnglishName: string = '',
        public assignmentTypeArabicName: string = '',
        public subjectWeightTypeID: number = 0,
        public subjectWeightTypeEnglishName: string = '',
        public subjectWeightTypeArabicName: string = '',
        public studentClassroomIDs: number[] = [],
        public assignmentQuestions: AssignmentQuestion[] = [],
        public assignmentStudents: AssignmentStudent[] = [],
        public assignmentStudentIsSpecifics: AssignmentStudent[] = [],
        public insertedByUserId: number = 0,
        public insertedByUserName: string = ''
    ) { }
}

export class AssignmentReportItem {
  constructor(
    public id: number = 0,
    public assignmentName: string = '',
    public subjectID: number = 0,
    public subjectName: string = '',
    public attendanceNumber: number = 0,
    public numberSuccessful: number = 0,
    public numberFailed: number = 0,
    public assigned: number = 0,
    public absent: number = 0
  ) {}
}