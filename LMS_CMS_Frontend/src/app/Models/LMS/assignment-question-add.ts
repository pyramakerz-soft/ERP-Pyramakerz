import { QuestionAssignmentTypeCount } from "./question-assignment-type-count";

export class AssignmentQuestionAdd {
    constructor(
        public assignmentID: number = 0,
        public lessonId: number = 0,
        public selectedTagsIds: number []= [],
        public file: File|null = null,
        public questionIds: number[] = [],
        public questionAssignmentTypeCountDTO: QuestionAssignmentTypeCount[] = [],
    ) { }
}
