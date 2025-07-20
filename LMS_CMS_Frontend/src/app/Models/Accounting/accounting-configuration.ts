export class AccountingConfiguration {
    constructor(
        public id: number = 0,
        public salesID: number|null = null,
        public salesReturnID: number|null = null,
        public purchaseID: number|null = null,
        public purchaseReturnID: number|null = null,
        public sales: string = '',
        public salesReturn: string = '',
        public purchase: string = '',
        public purchaseReturn: string = '',
    ) {}
}
  