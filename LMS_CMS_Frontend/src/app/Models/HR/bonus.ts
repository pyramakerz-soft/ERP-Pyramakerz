export class Bonus {
    constructor(
        public id: number = 0,
        public name: string = '',
        public date: string = '',
        public Notes: string = '',
        public amount: number = 0,
        public hours: number = 0,
        public minutes: number = 0,
        public numberOfBounsDays: number = 0,
        public employeeID: number = 0,
        public employeeEnName: string = '',
        public employeeArName: string = '',
        public bounsTypeID: number = 0,
        public bounsTypeName: string = '',
    ) { }
}
