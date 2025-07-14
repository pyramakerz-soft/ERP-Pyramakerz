import { ClassroomGroupDTO } from "./classroom-group-dto";

export class GradeGroupDTO {
      constructor(
       public gradeId: number,
       public gradeName: string,
       public classrooms: ClassroomGroupDTO[],
    ) { }
}
