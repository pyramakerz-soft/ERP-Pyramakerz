export class RegisteredEmployee {
     constructor(
        public id: number = 0,
        public user_Name: string = '', 
        public en_name: string = '',
        public ar_name: string = '',
        public password: string = '',
        public mobile: string = '',
        public phone: string = '', 
        public email: string = '', 
        public address: string = '', 
        public recaptchaToken: string = '', 
        public roleID: number = 0,
        public employeeTypeID: number = 0 
    ) {}
} 