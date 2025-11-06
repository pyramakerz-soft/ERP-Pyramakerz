export class Deduction {
    constructor(
        public id: number = 0,
        public name: string = '',
        public date: string = '',
        public notes: string = '',
        public amount: number | null = null,
        public hours: number | null = null,
        public minutes: number | null = null,
        public numberOfDeductionDays: number| null = null,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public deductionTypeID: number = 0,
        public deductionTypeName: string = '',
    ) { }
}
