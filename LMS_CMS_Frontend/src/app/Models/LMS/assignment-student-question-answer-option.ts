export class AssignmentStudentQuestionAnswerOption {
    constructor(
        public id: number = 0,
        public order: number = 0,
        public assignmentStudentQuestionID: number  = 0,
        public selectedOpionID: number = 0,
        public subBankQuestionID: number = 0,
        public answer: string = "",

    ) { }
}
