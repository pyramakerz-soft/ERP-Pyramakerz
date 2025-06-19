import { QuestionBank } from "./question-bank";


export class AssignmentQuestion {
      constructor(
        public id: number = 0,
        public assignmentID: number = 0,
        public questionBankID: number = 0,
        public questionBank: QuestionBank ,
        public insertedByUserId: number = 0,
    ) {}
}

