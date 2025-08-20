export class AppointmentGrade {
    constructor(
        public id: number = 0,
        public appointmentID: number = 0,
        public appointmentTitle: string = '',
        public gradeID: number = 0,
        public gradeName: string = '',        
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
