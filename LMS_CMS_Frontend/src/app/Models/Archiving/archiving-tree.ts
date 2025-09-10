export class ArchivingTree {
    constructor(
        public id: number = 0,
        public name: string = '',
        public fileLink: string = '',
        public fileFile : File|null = null,
        public archivingTreeParentID: number = 0, 
        public children: ArchivingTree[] = [], 
        public insertedByUserId :number = 0,


        public allow_Delete: boolean = false,  
        public allow_Delete_For_Others: boolean = false,
        public selected: boolean = false 
    ) {}
}
