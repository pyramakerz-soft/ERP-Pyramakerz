import { LessonResource } from "./lesson-resource";

export class LessonResourceType {
    constructor(
        public id: number = 0,
        public englishName : string = '',
        public arabicName: string = '',
        public resources : LessonResource[]=[],
        public insertedByUserId: number = 0,
    ) {}
}
