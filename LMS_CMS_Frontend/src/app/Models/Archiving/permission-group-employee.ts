export class PermissionGroupEmployee {
    constructor(
        public id: number = 0,
        public permissionGroupID: number = 0,
        public employeeID: number = 0,
        public employeeEnglishName: string = '',
        public employeeArabicName: string = '',
        public insertedByUserId :number =0
    ) {}
}
