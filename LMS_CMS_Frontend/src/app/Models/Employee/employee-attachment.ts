export class EmployeeAttachment {
 constructor(
        public id: number = 0,
        public employeeID: number = 0,
        public size: number = 0,
        public name: string = '',
        public fileName : string = '',
        public link: string = '',
        public type: string = '',
        public lastModified:  number = 0,
        public file: File = new File([], '')
    ) {}
}

