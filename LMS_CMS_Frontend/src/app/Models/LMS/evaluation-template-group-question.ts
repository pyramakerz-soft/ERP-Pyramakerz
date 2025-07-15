export class EvaluationTemplateGroupQuestion {
    constructor(
        public id: number = 0,
        public englishTitle : string = '',
        public arabicTitle  : string = '',
        public mark: number|null = null,
        public evaluationTemplateGroupID: number = 0,
        public insertedAt: string = '',
        public insertedByUserId: number = 0,
    ) {}
}
