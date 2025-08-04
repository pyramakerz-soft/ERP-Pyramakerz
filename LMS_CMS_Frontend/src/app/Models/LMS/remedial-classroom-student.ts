export class RemedialClassroomStudent {
     constructor(
        public id: number = 0,
        public remedialClassroomID: number = 0,
        public remedialClassroomName: string = '',
        public studentID: number = 0,
        public studentEnName: string = '',
        public studentArName: string = '',
        public studentIds: number[] = [],
        public insertedAt: string = '',
        public insertedByUserId: number = 0,
    ) { }
}

