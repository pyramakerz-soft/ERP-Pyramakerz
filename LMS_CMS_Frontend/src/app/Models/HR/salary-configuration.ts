export class SalaryConfiguration {
    constructor(
        public id: number = 0,
        public startDay: number = 0,
        public fromPreviousMonth: boolean = false,
        public overtimeStartAfterMinutes: number| null = 0,
    ) { }
}
