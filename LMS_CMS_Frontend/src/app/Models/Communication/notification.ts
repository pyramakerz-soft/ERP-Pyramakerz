import { NotificationSharedTo } from "./notification-shared-to";

export class Notification {
    constructor(
        public id: number = 0,  
        public imageLink: string = '',
        public imageFile : File|null = null,
        public text: string = '',
        public link: string = '',
        public isAllowDismiss: boolean = false,
        public userTypeID :number =0,
        public insertedByUserId :number =0,
        public notificationSharedTos : NotificationSharedTo[]=[]
    ) {}
} 