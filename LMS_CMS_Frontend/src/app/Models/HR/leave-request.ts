export class LeaveRequest {
    constructor(
        public id: number = 0,
        public date: string = '',
        public hours: number = 0,
        public minutes: number = 0,
        public totalAmount: number = 0,
        public monthlyLeaveRequestBalance: number = 0,
        public used: number = 0,
        public remains: number = 0,
        public notes: string = '',
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
    ) { }
}
