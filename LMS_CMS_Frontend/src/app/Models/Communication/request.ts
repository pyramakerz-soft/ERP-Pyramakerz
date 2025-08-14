export class Request {
    constructor(
        public id: number = 0,  
        public fileLink: string = '',
        public link: string = '',
        public message: string = '',
        public seenOrNot: boolean = false,
        public forwardedOrNot: boolean = false,
        public approvedOrNot: boolean = false, 
        public insertedAt: string = '', 
        public forwardedAt: string = '', 
        public senderID: number = 0,  
        public senderEnglishName: string = '',
        public senderArabicName: string = '',
        public receiverID: number = 0,  
        public receiverEnglishName: string = '',
        public receiverArabicName: string = '',
        public forwardedToID: number = 0,  
        public forwardedToEnglishName: string = '',
        public forwardedToArabicName: string = '',
        public forwardedFromID: number = 0,  
        public forwardedFromEnglishName: string = '',
        public forwardedFromArabicName: string = '',
        public senderUserTypeID: number = 0,  
        public senderUserTypeName: string = '',
        public receiverUserTypeID: number = 0,  
        public receiverUserTypeName: string = '',
         
        public fileFile : File|null = null, 
        public studentID: number = 0,  
        
        // For Forward
        public requestID: number = 0,  
        public forwardToID: number = 0
    ) {}   
}      