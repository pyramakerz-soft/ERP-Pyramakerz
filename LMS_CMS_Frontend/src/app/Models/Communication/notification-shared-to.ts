export class NotificationSharedTo {
     constructor(
        public id: number = 0,  
        public userId :number =0,
        public notifiedOrNot: boolean = false,
        public notificationID :number =0,
        public userTypeID :number =0,
        public imageLink: string = '', 
        public text: string = '',
        public link: string = '',
        public isAllowDismiss: boolean = false
    ) {}
}
 