export class PermissionGroupDetails {
    constructor(
        public id: number = 0,
        public allow_Delete: boolean = false, 
        public allow_Delete_For_Others: boolean = false, 
        public archivingTreeID: number = 0,
        public permissionGroupID: number = 0,
        public archivingTreeDetails: PermissionGroupDetails[] = [], 
    ) {}
}  