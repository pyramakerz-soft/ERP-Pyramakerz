import { ClassroomSubject } from "./classroom-subject";

export class ClassroomSubjectGroupBy {
        constructor(
        public classroomID: number = 0,
        public classroomName: number = 0,
        public subjects: ClassroomSubject[] = [],
    ) { }
}
