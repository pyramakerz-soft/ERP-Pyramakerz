export class SubjectWeight {
    constructor(
        public id: number = 0,
        public value: number|null = null,
        public weightTypeID: number = 0,
        public weightTypeEnglishName: string = '',
        public weightTypeArabicName: string = '',
        public subjectID: number = 0,
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '', 
        public insertedByUserId: number = 0,
    ) {}
} 