import { SubjectTeacherDTO } from "./subject-teacher-dto";

export class SessionGroupDTO {
      constructor(
       public sessionId: number=0,
       public dutyTeacherId: number=0,
        public dutyTeacherName: string = '',
       public subjects: SubjectTeacherDTO[]=[],
    ) { }
}
