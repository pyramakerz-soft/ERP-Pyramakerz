import { QuestionBankOption } from "./question-bank-option";
import { SubBankQuestion } from "./sub-bank-question";

export class AssignmentStudentQuestion {
    constructor(
        public id: number = 0,
        public mark: number = 0,
        public questionMark: number = 0,
        public assignmentStudentID: number = 0,
        public questionBankID: number = 0,
        public questionTypeID: number = 0,
        public answerOptionID: number = 0,
        public answer: string = "",
        public questionDesc: string = "",
        public questionImage: string = "",
        public questionTypeName: string = "",
        public assignmentStudentQuestionAnswerOption: AssignmentStudentQuestion[] = [],
        public questionBankOptions: QuestionBankOption[] = [],
        public subBankQuestion: SubBankQuestion[] = [],
    ) { }
}



