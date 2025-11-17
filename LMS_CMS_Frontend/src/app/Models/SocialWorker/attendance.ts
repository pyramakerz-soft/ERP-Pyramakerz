import { AttendanceStudent } from "./attendance-student";

export class Attendance {
    constructor(
        public id: number = 0,
        public date: string = '',
        public academicYearID: number = 0,
        public academicYearName: string = '',
        public schoolID: number = 0,
        public schoolName: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',
        public classroomID: number = 0,
        public classroomName: string = '',
        public attendanceStudents : AttendanceStudent[]=[],
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}

export class  AttendanceReportItem {
    constructor(
        public id: number,
        public date: string,
        public studentID: number,
        public studentName: string,
        public notes: string,
        public isLate: boolean,
        public lateTimeInMinutes: number,
            ) {}
}


