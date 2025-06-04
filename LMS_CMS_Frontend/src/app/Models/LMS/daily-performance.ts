import { StudentPerformance } from "./student-performance";

export class DailyPerformance {
  constructor(
    public id: number = 0,
    public subjectID: number = 0,
    public subjectName: string = "",
    public classID: number = 0,
    public className: string = "",
    public gradeID: number = 0,
    public gradeName: string = "",
    public studentID: number = 0,
    public studentName: string = "",
    public comment: string = "",
    public studentPerformance: StudentPerformance[] = [],
    public insertedByUserId: number = 0
  ) { }
}
