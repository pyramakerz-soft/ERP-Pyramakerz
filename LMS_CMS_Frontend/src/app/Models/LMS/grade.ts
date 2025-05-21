export class Grade {
    constructor(
        public id: number = 0,
        public name : string = '',
        public dateFrom: string = '',
        public dateTo : string = '',
        public insertedByUserId: number = 0,
        public sectionID: number = 0,
        public sectionName: string = '',
        public sat: number|null = null,
        public sun: number|null = null,
        public mon: number|null = null,
        public tus: number|null = null,
        public wed: number|null = null,
        public thru: number|null = null,
        public fri: number|null = null,
    ) {}
}
