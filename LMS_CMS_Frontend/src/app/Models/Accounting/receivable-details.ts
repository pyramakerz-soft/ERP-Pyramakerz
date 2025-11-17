export class ReceivableDetails {
    constructor(
        public id: number = 0,
        public amount: number|any = null,
        public notes: string|null = null,
        public receivableMasterID: number = 0,
        public linkFileID: number = 0,
        public linkFileName: string = '',
        public linkFileTypeID: number = 0, 
        public linkFileTypeName: string = '',
        public linkFileTypesData : any[]=[],
        public insertedByUserId: number = 0
    ) {}
}
