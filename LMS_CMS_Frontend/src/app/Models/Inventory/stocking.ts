import { StockingDetails } from "./stocking-details";

export class Stocking {
    constructor(
        public id: number = 0,
        public date: string = '',
        public storeID: number = 0,
        public additionId: number = 0,
        public disbursementId: number = 0,
        public schoolId: number = 0,
        public schoolName: string = "",
        public schoolPCId: number = 0,
        public schoolPCName: string = "",
        public storeName: string = '',
        public stockingDetails: StockingDetails[] = [],
        public newDetailsWhenEdit: StockingDetails[] = [],
        public updatedStockingDetails: StockingDetails[] = [],
        public deletedStockingDetails: number[] = [],
        public insertedAt: string = "",
        public insertedByUserId: number = 0,
    ) { }
}
