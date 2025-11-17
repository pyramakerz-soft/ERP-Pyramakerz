export class SocialWorkerMedal {
    constructor(
        public id: number = 0,
        public name: string = '',
        public file: string = '',
        public newFile: File | null = null,
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
