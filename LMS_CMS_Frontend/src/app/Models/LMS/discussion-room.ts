import { DiscussionRoomStudentClassroom } from "./discussion-room-student-classroom";

export class DiscussionRoom {
    constructor(
        public id: number = 0,
        public title: string = '',
        public imageLink: string = '',
        public meetingLink: string = '',
        public recordLink: string = '',
        public startDate: string = '',
        public endDate: string = '',
        public time: string = '',
        public isRepeatedWeekly: boolean = false,
        public insertedByUserId :number =0,
        public discussionRoomStudentClassrooms : DiscussionRoomStudentClassroom[]=[],
        public studentClassrooms : number[]=[],
        public imageFile : File|null = null
    ) {}
}  