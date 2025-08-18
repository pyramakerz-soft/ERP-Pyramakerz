export class AttendanceStudent {
    constructor(
        public id: number = 0,
        public note: string = '',
        public isLate: boolean = false,
        public isAbsent: boolean = false,
        public lateTimeInMinutes: number = 0,
        public attendanceID: number = 0,
        public studentID: number = 0,
        public studentArName: string = '',
        public studentEnName: string = '',
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
