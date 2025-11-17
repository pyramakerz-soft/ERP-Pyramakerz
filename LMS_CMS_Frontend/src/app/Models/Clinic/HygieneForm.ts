export class HygieneForm {
  constructor(
    public id: number,
    public schoolId: number,
    public school: string,
    public gradeId: number,
    public grade: string,
    public classRoomID: number,
    public classRoom: string,
    public insertedAt: string,
    public date: string,
    public studentHygieneTypes: StudentHygieneType[]
  ) {}
}

export class StudentHygieneType {
  constructor(
    public id: number = 0,
    public studentId: number = 0,
    public student: string = '',
    public en_name: string | null = null,
    public hygieneFormId: number = 0,
    public attendance: boolean = false,
    public comment: string = '',
    public actionTaken: string = '',
    public selectAll: boolean = false,
    public hygieneTypes: HygieneType[] = []
  ) {}
}

export class HygieneType {
  constructor(
    public id: number = 0,
    public type: string = '',
    public en_name: string = '',
    public insertedByUserId: number = 0
  ) {}
}
