export class StudentIssue {
    constructor(
        public id: number = 0,
        public details: string = '',
        public date: string = '',
        public studentID: number = 0,
        public studentEnName: string = '',
        public studentArName: string = '',
        public classroomID: number = 0,
        public classroomName: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',
        public schoolID: number = 0,
        public schoolName: string = '',
        public issuesTypeID: number = 0,
        public issuesTypeName: string = '',
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
export class StudentIssueReportItem {
    constructor(
  public id: number,
  public date: string,
  public studentID: number,
  public studentName: string,
  public issuesType: {
     id: number,
     name: string,
  },
  public details: string,
){}
}
