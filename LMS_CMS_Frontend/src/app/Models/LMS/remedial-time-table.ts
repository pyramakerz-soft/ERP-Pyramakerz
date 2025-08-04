export class RemedialTimeTable {
    constructor(
        public id: number = 0,
        public name: string = '',
        public isFavourite: boolean = false,
        public academicYearID: number = 0,
        public schoolID: number = 0,
        public academicYearName: string = '',
        public insertedAt: string = '',
        public insertedByUserId: number = 0
    ) { }
}
