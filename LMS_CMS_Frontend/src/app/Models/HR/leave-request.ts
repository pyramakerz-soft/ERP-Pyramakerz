export class LeaveRequest {
    constructor(
        public id: number = 0,
        public date: string = '',
        public hours: number | null = null,
        public minutes: number | null = null,
        public totalAmount: number| null = null,
        public monthlyLeaveRequestBalance: number = 0,
        public used: number| null = null,
        public remains: number | null = null,
        public notes: string = '',
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
    ) { }
}
