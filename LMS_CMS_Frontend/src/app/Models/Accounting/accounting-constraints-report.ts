export class AccountingConstraintsReport {
    constructor(
        public masterID: number = 0,
        public detailsID: number = 0,

        public name: string = '',
        public accountNumberName: string = '',
        public accountNumberID :number =0,
        
        public credit :number =0,
        public debit :number =0,
    ) {}
}

 
    // "account": "Doc 1",
    // "invoiceNumber": "34456",
    // "mainAccountNo": 2,
    // "mainAccount": "Suppliers",
    // "subAccountNo": 11,
    // "subAccount": "two" 