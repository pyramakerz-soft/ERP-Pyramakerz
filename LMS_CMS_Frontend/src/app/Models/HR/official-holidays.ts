export class OfficialHolidays {
    constructor(
        public id: number = 0,
        public name: string = '',
        public dateFrom: string = '',
        public dateTo: string = '',
        public insertedAt: string = "",
        public insertedByUserId: number = 0,
    ) { }
}
