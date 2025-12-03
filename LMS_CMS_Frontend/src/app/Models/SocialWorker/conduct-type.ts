import { ConductTypeSection } from "./conduct-type-section";

export class ConductType {
    constructor(
        public id: number = 0,
        public en_name: string = '',
        public ar_name: string = '',
        public conductLevelID: number = 0,
        public conductLevelName: string = '',
        public schoolID: number = 0,
        public schoolName: string = '',
        public conductTypeSections: ConductTypeSection[] = [],
        public sectiondids: number[] = [],
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
