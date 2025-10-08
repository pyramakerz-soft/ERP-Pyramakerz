import { EmployeeLoans } from "./employee-loans";
import { Loans } from "./loans";

export class LoanStatus {
    constructor(
        public totalLoans: number = 0,
        public totalDeducted: number = 0,
        public remaining: number = 0,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public loansDTO: Loans[] = [],
        public employeeLoansGetDTO: EmployeeLoans[] = [],
    ) { }
}



