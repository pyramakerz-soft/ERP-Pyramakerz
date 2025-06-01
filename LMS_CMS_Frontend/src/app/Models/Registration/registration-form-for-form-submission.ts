import { RegistrationFormSubmission } from "./registration-form-submission";

export class RegistrationFormForFormSubmission {
    constructor(
        public registrationFormID: number = 0,
        public isStudent: boolean = false,
        public registerationFormSubmittions: RegistrationFormSubmission[] = []
    ) {}
}
