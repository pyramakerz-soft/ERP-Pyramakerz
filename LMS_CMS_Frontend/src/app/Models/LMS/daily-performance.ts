import { StudentPerformance } from "./student-performance";

export class DailyPerformance {
  constructor(
    public id: number = 0,
    public studentID: number = 0,
    public studentName: string = "",
    public comment: string = "",
    public studentPerformance: StudentPerformance[] = [],
    public insertedByUserId: number = 0
  ) { }
}
