export class AppointmentParent {
        constructor(
        public id: number = 0,
        public appointmentID: number = 0,
        public appointmentTitle: string = '',
        public date: string = '',
        public dueDateToParentToAccept: string = '',
        public appointmentStatusID: number = 0,
        public appointmentStatusName: string = '',        
        public parentID: number = 0,
        public parentEnName: string = '',        
        public parentArName: string = '',        
        public insertedByUserId: number = 0,
        public insertedByUserName: string = '',
        public insertedAt: string = '',
    ) { }
}
