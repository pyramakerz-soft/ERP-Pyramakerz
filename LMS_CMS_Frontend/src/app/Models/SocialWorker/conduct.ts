import { ConductType } from "./conduct-type";
import { ProcedureType } from "./procedure-type";

export class Conduct {
    constructor(
        public id: number = 0,
        public details: string = '',
        public date: string = '',
        public isSendSMSToParent: boolean = false,
        public conductTypeID: number = 0,
        public conductTypeEnName: string = '',
        public conductTypeArName: string = '',
        public studentID: number = 0,
        public studentArName: string = '',
        public studentEnName: string = '',
        public schoolID: number = 0,
        public schoolName: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',
        public classroomID: number = 0,
        public classroomName: string = '',
        public procedureTypeID: number = 0,
        public procedureTypeName: string = '',
        public newFile: File | null = null,
        public file: string = "",
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}

export class ConductReportItem {
    constructor(
  public id: number,
  public date: string,
  public studentID: number,
  public studentEnName: string,
  public conductType: ConductType,
  public procedureType: ProcedureType,
  public details: string,
    ){}
}
