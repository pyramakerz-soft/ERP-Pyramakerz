import { EmployeeTypeGet } from "../Administrator/employee-type-get";

export class ViolationType {
    constructor(
        public id: number = 0,
        public name: string = '',
        public employeeTypes: EmployeeTypeGet[] = [],
        public employeeTypeIds: number[] = [],
        public insertedByUserId: number = 0,
    ) { }
}
