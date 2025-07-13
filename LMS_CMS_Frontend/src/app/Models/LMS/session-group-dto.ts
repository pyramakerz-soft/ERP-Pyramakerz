import { SubjectTeacherDTO } from "./subject-teacher-dto";

export class SessionGroupDTO {
      constructor(
       public sessionId: number,
       public subjects: SubjectTeacherDTO[],
    ) { }
}
