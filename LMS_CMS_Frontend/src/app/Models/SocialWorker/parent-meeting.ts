export class ParentMeeting {
    constructor(
        public id: number = 0,
        public title: string = '',
        public date: string = '',
        public url: string = '',
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
