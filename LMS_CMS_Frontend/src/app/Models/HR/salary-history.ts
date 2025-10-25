export class SalaryHistory {
    constructor(
        public id: number = 0,
        public year: number = 0,
        public month: number = 0,

        public basicSalary: number = 0,
        public totalBonus: number = 0,
        public totalOvertime: number = 0,
        public totalDeductions: number = 0,
        public totalLoans: number = 0,
        public netSalary: number = 0,


        public employeeId: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',

        public insertedAt: string = "",
        public insertedByUserId: number = 0,
    ) { }

}


