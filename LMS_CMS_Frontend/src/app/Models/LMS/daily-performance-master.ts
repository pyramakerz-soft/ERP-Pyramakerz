import { DailyPerformance } from "./daily-performance";

export class DailyPerformanceMaster {
     constructor(
        public id: number = 0,
        public subjectID: number = 0,
        public subjectName: string = "",
        public classroomID: number = 0,
        public classroomName: string = "",
        public gradeID: number = 0,
        public gradeName: string = "",
        public dailyPerformances: DailyPerformance[] = [],
        public insertedByUserId: number = 0 ,
        public insertedAt: string = "",
      ) { }
}
