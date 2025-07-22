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

export interface StudentHygieneType {
  id: number;
  studentId: number;
  student: string;
  en_name: string | null;
  hygieneFormId: number;
  attendance: boolean;
  comment: string;
  actionTaken: string;
  selectAll: boolean;
  hygieneTypes: HygieneType[];
}

export interface HygieneType {
  id: number;
  type: string;
  en_name: string;
  insertedByUserId: number;
}
