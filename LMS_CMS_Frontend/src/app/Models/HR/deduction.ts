export class Deduction {
    constructor(
        public id: number = 0,
        public name: string = '',
        public date: string = '',
        public notes: string = '',
        public amount: number = 0,
        public hours: number = 0,
        public minutes: number = 0,
        public numberOfDeductionDays: number = 1,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public deductionTypeID: number = 0,
        public deductionTypeName: string = '',
    ) { }
}
