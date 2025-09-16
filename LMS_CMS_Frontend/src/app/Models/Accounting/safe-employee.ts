export class SafeEmployee {
    constructor(
        public id: number = 0,
        public saveID: number = 0,
        public insertedByUserId: number = 0,
        public employeeIDs: number[] = [],
        public employeeEnglishName: string = '', 
        public employeeArabicName: string = '', 
    ) {}
}
