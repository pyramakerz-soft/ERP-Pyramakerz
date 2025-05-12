export class EmployeeAttachment {
 constructor(
        public id: number = 0,
        public name: string = '',
        public link: string = '',
        public file: File = new File([], '')
    ) {}
}
