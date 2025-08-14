import { UserFilters } from "./user-filters";

export class Request {
    constructor(
        public id: number = 0,  
        public fileLink: string = '',
        public link: string = '',
        public message: string = '',
        public seenOrNot: boolean = false,
        public forwardedOrNot: boolean = false,
        public approvedOrNot: boolean = false,
        public seenOrNotByTransferee: boolean = false,
        public insertedAt: string = '', 
        public forwardedAt: string = '', 
        public senderID: number = 0,  
        public senderEnglishName: string = '',
        public senderArabicName: string = '',
        public receiverID: number = 0,  
        public receiverEnglishName: string = '',
        public receiverArabicName: string = '',
        public transfereeID: number = 0,  
        public transfereeEnglishName: string = '',
        public transfereeArabicName: string = '',
        public senderUserTypeID: number = 0,  
        public senderUserTypeName: string = '',
        public receiverUserTypeID: number = 0,  
        public receiverUserTypeName: string = '',
        
        public userFilters : UserFilters= new UserFilters(),
        public fileFile : File|null = null, 
        public studentID: number = 0,  
        
        // For Forward
        public requestID: number = 0,  
        public forwardToID: number = 0
    ) {}   
} 
   