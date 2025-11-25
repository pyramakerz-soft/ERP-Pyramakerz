export class Bonus {
    constructor(
        public id: number = 0,
        public date: string = '',
        public notes: string = '',
        public amount: number | null = null,
        public hours: number | null = null,
        public minutes: number | null = null,
        public numberOfBonusDays: number | null = null,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public bonusTypeID: number = 0,
        public bonusTypeName: string = '',
    ) { }
}
