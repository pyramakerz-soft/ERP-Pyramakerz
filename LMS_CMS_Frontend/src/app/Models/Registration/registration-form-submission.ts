export class RegistrationFormSubmission {
    constructor(
        public id:number = 0,
        public textAnswer: string | null = null,
        public categoryFieldID: number = 0,
        public registerationFormParentID:number = 0,
        public selectedFieldOptionID: number | null = null
    ) {}
}
