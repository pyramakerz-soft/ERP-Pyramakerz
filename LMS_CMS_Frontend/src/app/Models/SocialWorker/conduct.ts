export class Conduct {
    constructor(
        public id: number = 0,
        public details: string = '',
        public date: string = '',
        public isSendSMSToParent: boolean = false,
        public conductTypeID: number = 0,
        public conductTypeName: string = '',
        public studentID: number = 0,
        public studentName: string = '',
        public procedureTypeID: number = 0,
        public procedureTypeName: string = '',
        public newFile: File | null = null,
        public file: string = "",
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
