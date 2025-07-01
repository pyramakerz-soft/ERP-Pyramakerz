import { LessonActivity } from "./lesson-activity";

export class LessonActivityType {
    constructor(
        public id: number = 0,
        public englishName : string = '',
        public arabicName: string = '',
        public activities : LessonActivity[]=[],
        public insertedByUserId: number = 0,
    ) {}
}
