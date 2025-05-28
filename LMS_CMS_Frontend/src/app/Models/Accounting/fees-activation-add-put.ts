export class FeesActivationAddPut { 
    constructor(
        public feeActivationID: number = 0,
        public amount: number|null = null,
        public discount: number|null = null,
        public net: number|null = null,
        public date: string ="",
        public feeTypeID: number = 0,
        public feeDiscountTypeID: number = 0,
        public studentID: number = 0,
        public academicYearId: number = 0,
    ) {}
}

