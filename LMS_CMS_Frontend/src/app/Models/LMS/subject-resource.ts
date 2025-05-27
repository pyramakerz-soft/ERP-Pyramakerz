export class SubjectResource {
    constructor(
        public id: number = 0, 
        public englishName: string ='',
        public arabicName: string = '',
        public subjectID: number = 0,
        public subjectEnglishName: string = '',
        public subjectArabicName: string = '', 
        public fileLink: string = '',
        public file : File|null = null,
        public insertedByUserId: number = 0,
    ) {}
}
