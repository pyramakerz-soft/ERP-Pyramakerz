import { Student } from "../student";
import { ClassroomStudent } from "./classroom-student";

export class ClassStudentForDiscussionRoom {
    constructor(
        public classroomId: number = 0, 
        public classroomName: string = '', 
        public students: ClassroomStudent[] = []
    ) {}
} 