export class CertificateStudent {
    constructor(
        public id: number = 0,
        public studentID: number = 0,
        public studentEnName: string = '',
        public studentArName: string = '',
        public certificateTypeID: number = 0,
        public certificateTypeName: string = '',
        public certificateTypeFile: string = '',
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
