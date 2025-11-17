export class MonthlyAttendance {
    constructor(
        public id: number = 0,
        public day: string = '',

        public workingHours: number = 0,
        public workingMinutes: number = 0,
        public deductionHours: number = 0,
        public deductionMinutes: number = 0,
        public overtimeHours: number = 0,
        public overtimeMinutes: number = 0,
        public leaveRequestHours: number = 0,
        public leaveRequestMinutes: number = 0,

        public employeeId: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',

        public dayStatusId: number = 0,
        public dayStatusName: string = '',

        public insertedAt: string = "",
        public insertedByUserId: number = 0,
    ) { }
}

