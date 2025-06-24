export class POS {
    constructor(
        public id: number = 0,
        public name: string = '', 
        public clientID: string = '', 
        public clientSecret: string = '', 
        public clientSecret2: string = '', 
        public deviceSerialNumber: string = '', 
        public insertedByUserId :number =0,
    ) {}
}
