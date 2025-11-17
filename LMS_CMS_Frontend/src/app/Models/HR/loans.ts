export class Loans {
    constructor(
        public id: number = 0,
        public date: string = '',
        public notes: string = '',
        public deductionStartMonth: number = 0,
        public deductionStartYear: number = 0,
        public deductionEndMonth: number = 0,
        public deductionEndYear: number = 0,
        public amount: number | null = null,
        public numberOfDeduction: number =1,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public safeID: number = 0,
        public saveName: string = '',
    ) { }
}


