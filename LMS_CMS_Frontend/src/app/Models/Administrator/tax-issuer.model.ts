export class TaxIssuer {
    constructor(
        public id: number = 0,
        public name: string = '',
        public typeID: number = 0,
        public taxType: string = '',
        public branchID: string = '',
        public activityCode: string = '',
        public governate: string = '',
        public regionCity: string = '',
        public street: string = '',
        public buildingNumber: string = '',
        public postalCode: string = '',
        public floor: string = '',
        public room: string = '',
        public landMark: string = '',
        public additionalInfo: string = '',
        public countryCode: string = ''
    ) {}
} 