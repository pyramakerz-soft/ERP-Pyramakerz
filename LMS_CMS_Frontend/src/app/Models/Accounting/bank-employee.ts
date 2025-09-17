export class BankEmployee {
    constructor(
        public id: number = 0,
        public bankID: number = 0,
        public insertedByUserId: number = 0,
        public employeeID: number = 0,
        public employeeIDs: number[] = [],
        public employeeEnglishName: string = '', 
        public employeeArabicName: string = '', 
    ) {}
}
