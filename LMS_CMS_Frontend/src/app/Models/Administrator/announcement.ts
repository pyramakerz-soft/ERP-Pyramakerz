import { AnnouncementSharedTo } from "./announcement-shared-to";

export class Announcement {
    constructor(
        public id: number = 0,
        public title: string = '',
        public imageLink: string = '',
        public insertedByUserId :number =0,
        public announcementSharedTos : AnnouncementSharedTo[]=[],
        public userTypeIDs : number[]=[],
        public imageFile : File|null = null
    ) {}
} 