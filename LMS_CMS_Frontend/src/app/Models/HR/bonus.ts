export class Bonus {
    constructor(
        public id: number = 0,
        public date: string = '',
        public notes: string = '',
        public amount: number | null = null,
        public hours: number | null = null,
        public minutes: number | null = null,
        public numberOfBounsDays: number | null = null,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public bounsTypeID: number = 0,
        public bounsTypeName: string = '',
    ) { }
}
