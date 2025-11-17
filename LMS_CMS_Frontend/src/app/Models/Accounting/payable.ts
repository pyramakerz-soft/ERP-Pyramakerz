import { PayableDetails } from "./payable-details";

export class Payable {
    constructor(
        public id: number = 0,
        public docNumber: string|null = null,
        public date: string = '',
        public notes: string|null = null,
        public payableDocTypeID: number = 0,
        public payableDocTypesName: string = '',
        public linkFileID: number = 0,
        public linkFileName: string = '',
        public bankOrSaveID: number = 0,
        public bankOrSaveName: string = '',
        public payableDetails : PayableDetails []=[] ,
        public newDetails : PayableDetails []=[] ,
        public updatedDetails : PayableDetails []=[] ,
        public insertedByUserId: number = 0
    ) {}
}
