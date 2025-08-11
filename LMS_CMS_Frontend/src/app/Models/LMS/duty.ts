export class Duty {
  constructor(
    public id: number = 0,
    public timeTableSessionID: number = 0,
    public date: string = '',
    public className: string = '',
    public schoolName: string = '',
    public teacherEnName: string = '0',
    public teacherArName: string = '0',
    public classID: number = 0,
    public schoolID: number = 0,
    public period: number = 0,
    public teacherID: number = 0,
    public insertedByUserId: number = 0
  ) { }
}


