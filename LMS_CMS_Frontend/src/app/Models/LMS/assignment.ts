import { AssignmentQuestion } from "./assignment-question";
import { AssignmentStudent } from "./assignment-student";

export class Assignment {
    constructor(
        public id: number = 0,
        public englishName: string = '',
        public arabicName: string = '',
        public mark: number|null = null,
        public openDate: string = '',
        public dueDate: string = '',
        public cutOfDate: string = '', 
        public isSpecificStudents: boolean = false,
        public isVisibleToStudent: boolean = false,
        public linkFile: string = '',
        public fileFile: File|null = null,
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '',
        public subjectID: number = 0,
        public assignmentTypeID: number = 0,
        public assignmentTypeEnglishName: string = '',
        public assignmentTypeArabicName: string = '',
        public subjectWeightTypeID: number = 0,
        public subjectWeightTypeEnglishName: string = '',
        public subjectWeightTypeArabicName: string = '',
        public studentClassroomIDs : number[]=[] ,
        public assignmentQuestions : AssignmentQuestion[]=[] ,
        public assignmentStudents : AssignmentStudent[]=[] ,
        public assignmentStudentIsSpecifics : AssignmentStudent[]=[] ,
        public insertedByUserId: number = 0
    ) {}
}
