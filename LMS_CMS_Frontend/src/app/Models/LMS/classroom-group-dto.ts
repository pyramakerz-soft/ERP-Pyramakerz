import { SessionGroupDTO } from "./session-group-dto";

export class ClassroomGroupDTO {

      constructor(
       public classroomId: number,
       public classroomName: string,
       public sessions: SessionGroupDTO[],
    ) { }
}
