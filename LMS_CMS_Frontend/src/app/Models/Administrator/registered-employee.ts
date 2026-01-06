import { EmployeeAttachment } from "../Employee/employee-attachment";

export class RegisteredEmployee {
    constructor(
        public id: number = 0,
        public en_name: string = '',
        public ar_name: string = '',
        public email: string = '',
        public phone: string = '',           
        public departmentName: string = '',  
        public positionAppliedFor: string = '', 
        public applicationDate: string = '', 
        public interviewStatus: string = '',
        public isHRScreened: boolean = false
    ) {}
}

export class RegisteredEmployeeAdd {

  constructor(
    public en_name: string = '',
    public ar_name: string = '',
    public email: string = '',
    public mobile: string = '',
    // public departmentID: number | null = null,
    public positionAppliedFor: string = '',
    public applicationDate: string = '', 
    public gender: string | null = null,
    public birthdayDate: string | null = null,
    public passportNumber: string | null = null,
    public maritalStatus: string | null = null,
    public passportAddress: string | null = null,
    public currentAddress: string | null = null,

    public university: string = '',
    public graduationYear: string = '',   
    public faculty: string = '',
    public major: string = '',
    public schoolYouGraduatedFrom: string = '',
    public otherStudies: string = '',
    public computerSkills: string = '',
    public hobbies: string | null = null,

    public previousExperiencePlace: string = '',
    public position: string = '',
    public fromDate: string = '',
    public toDate: string = '',

    public howDidYouFindUs: string = '',
    public reasonforLeavingtheJob: string = '',
    public didYouHaveAnyRelativeHere: string = '',
    public yourLevelInEnglish: string = '',
    public yourLevelInFrensh: string = '',
    public doYouSpeakAnyOtherLanguages: string = '',
    public currentJob: string = '',

    public lastSalary: number = 0,
    public authorizeInvestigation: boolean = false,
    public fullName: string = '',
    public EnterDate: string = '',
    public comment: string | null = null,
    public nationality: number | null = null,

    public files: EmployeeAttachment[] = [],
    public editedFiles: EmployeeAttachment[] = [],
    public profileImage: File | null = null,

  ) {}
}

