export class CertificateStudent {
    constructor(
        public id: number = 0,
        public studentID: number = 0,
        public studentEnName: string = '',
        public studentArName: string = '',
        public certificateTypeID: number = 0,
        public certificateTypeName: string = '',
        public certificateTypeFile: string = '',
        public topSpace: number = 0,
        public leftSpace: number = 0,
        public insertedByUserId: number = 0,
        public insertedByUserName: number = 0,
        public insertedAt: string = ""
    ) { }
}

export class CertificateStudentReportItem {
  constructor(
    public id: number,
    public medal: number,
    public medalName: string,
    public addedAt: string,
    public addedBy: string
  ) {}
}



