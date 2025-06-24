import { ClassroomStudent } from "./classroom-student";

export class StudentClassWhenSubject {
     constructor(
        public classroomID: number = 0, 
        public classroomName: string = '', 
        public studentClassrooms :ClassroomStudent[] = [],
    ) {}
}
