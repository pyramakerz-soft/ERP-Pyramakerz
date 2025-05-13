import { Form } from "@angular/forms";
import { QuestionBankOption } from "./question-bank-option";
import { SubBankQuestion } from "./sub-bank-question";

export class QuestionBank {
  constructor(
    public id: number = 0,
    public description?: string,
    public image?: string,
    public imageForm?: Form,
    public difficultyLevel: number = 0,
    public mark: number = 0,
    public essayAnswer?: string,
    public lessonID: number = 0,
    public lessonName: string = '',
    public bloomLevelID: number = 0,
    public bloomLevelName: string = '',
    public dokLevelID: number = 0,
    public dokLevelName: string = '',
    public questionTypeID: number = 0,
    public questionTypeName: string = '',
    public correctAnswerID: number= 0,
    public insertedByUserId: number = 0,
    public questionBankTagsDTO: number[] = [],
    public QuestionBankOptionsDTO: QuestionBankOption[] = [],
    public SubBankQuestionsDTO: SubBankQuestion[] = [],
  ) {}
}


