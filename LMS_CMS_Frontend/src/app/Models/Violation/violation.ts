import { EmployeeTypeGet } from "../Administrator/employee-type-get";

export class Violation {
    constructor(
        public id: number = 0,
        public details: string = '',
        public attach: string = '',
        public deletedAttach: string = '',
        public attachFile:  File|null = null,
        public date: string = '',
        public violationTypeID: number = 0,
        public violationTypeName: string = '',
        public employeeID: number = 0,
        public employeeTypeId: number = 0,
        public employeeTypeName: string = '',
        public employeeTypeArabicName: string = '',
        public employeeEnglishName: string = '',
        public employeeArabicName: string = '',
        public insertedByUserId :number =0,
    ) {}
}

