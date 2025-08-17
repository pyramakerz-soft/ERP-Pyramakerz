export class CertificateType {
        constructor(
        public id: number = 0,
        public name: string = '',
        public file: string = '',
        public newFile: File | null = null,
        public topSpace: number = 0,
        public leftSpace: number = 0,
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }

}
