import { ChatMessageAttachement } from "./chat-message-attachement";
import { UserFilters } from "./user-filters";

export class ChatMessage {
    constructor(
        public id: number = 0,  
        public message: string = '',
        public seenOrNot: boolean = false,
        public forwardedOrNot: boolean = false,
        public senderID: number = 0,  
        public senderEnglishName: string = '',
        public senderArabicName: string = '',
        public receiverID: number = 0,  
        public receiverEnglishName: string = '',
        public receiverArabicName: string = '', 
        public senderUserTypeID: number = 0,  
        public senderUserTypeName: string = '',
        public receiverUserTypeID: number = 0,  
        public receiverUserTypeName: string = '',
        public insertedAt: string = '',
        public chatMessageAttachments : ChatMessageAttachement[]=[], 
        public chatMessageAttachmentFiles : File[]|null=null, 
        public userFilters : UserFilters= new UserFilters(),
        public chatMessageID: number = 0,
        public unreadCount: number = 0
    ) {}    
}      