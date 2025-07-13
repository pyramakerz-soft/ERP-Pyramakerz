export class AccountingConstraintsReport {
    constructor(
        public masterID: number = 0,
        public detailsID: number = 0,
        public account: string = '',
        public invoiceNumber: string = '',
        public mainAccountNo :number =0,
        public mainAccount: string = '',
        public subAccountNo :number =0,
        public subAccount: string = '',
        public credit :number|null = null,
        public debit :number|null = null,
        public date: string = '',
    ) {}
} 