import { AssignmentQuestion } from "./assignment-question";

export class Assignment {
     constructor(
        public id: number = 0,
        public englishName: string = '',
        public arabicName: string = '',
        public mark: number = 0,
        public openDate: Date = new Date(),
        public dueDate: Date = new Date(),
        public cutOfDate: Date = new Date(),
        public linkFile: string = '',
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '',
        public subjectID: number = 0,
        public assignmentTypeID: number = 0,
        public assignmentTypeEnglishName: string = '',
        public assignmentTypeArabicName: string = '',
        public asSpecificStudents: boolean = false,
        public assignmentQuestions : AssignmentQuestion[]=[] ,
        public insertedByUserId: number = 0,
    ) {}
}
