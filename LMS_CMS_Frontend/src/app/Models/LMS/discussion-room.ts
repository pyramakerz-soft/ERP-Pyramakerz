import { DiscussionRoomStudentClassroom } from "./discussion-room-student-classroom";

export class DiscussionRoom {
    constructor(
        public id: number = 0,
        public schoolID: number = 0,
        public title: string = '',
        public imageLink: string = '',
        public meetingLink: string = '',
        public recordLink: string = '',
        public startDate: string = '',
        public endDate: string = '',
        public time: string = '',
        public isRepeatedWeekly: boolean = false,
        public saturday: boolean = false,
        public sunday: boolean = false,
        public monday: boolean = false,
        public tuesday: boolean = false,
        public wednesday: boolean = false,
        public thursday: boolean = false,
        public friday: boolean = false,
        public insertedByUserId :number =0,
        public discussionRoomStudentClassrooms : DiscussionRoomStudentClassroom[]=[],
        public studentClassrooms : number[]=[],
        public imageFile : File|null = null
    ) {}
}   