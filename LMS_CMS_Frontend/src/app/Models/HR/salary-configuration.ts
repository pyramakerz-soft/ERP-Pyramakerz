export class SalaryConfiguration {
    constructor(
        public id: number = 0,
        public startDay: string = '',
        public frompreviousmonth: boolean = false,
    ) { }
}
