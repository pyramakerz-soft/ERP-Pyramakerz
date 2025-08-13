import { UserFilters } from "./user-filters";

export class Request {
    constructor(
        public id: number = 0,  
        public fileLink: string = '',
        public Link: string = '',
        public message: string = '',
        public SeenOrNot: boolean = false,
        public ForwardedOrNot: boolean = false,
        public ApprovedOrNot: boolean = false,
        public SeenOrNotByTransferee: boolean = false,
        public fileFile : File|null = null, 
        public insertedAt: string = '', 
        public userFilters : UserFilters= new UserFilters(),

        // For Forward
        public requestID: number = 0,  
        public forwardToID: string = '',
    ) {}   
}

 
//   public long SenderID { get; set; }
//   public string SenderEnglishName { get; set; }
//   public string SenderArabicName { get; set; }
//   public long ReceiverID { get; set; }
//   public string ReceiverEnglishName { get; set; }
//   public string ReceiverArabicName { get; set; }
//   public long? TransfereeID { get; set; }
//   public string TransfereeEnglishName { get; set; }
//   public string TransfereeArabicName { get; set; }
//   public long SenderUserTypeID { get; set; }
//   public string SenderUserTypeName { get; set; }
//   public long ReceiverUserTypeID { get; set; }
//   public string ReceiverUserTypeName { get; set; }