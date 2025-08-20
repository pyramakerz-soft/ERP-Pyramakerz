export class AppointmentStatus {
    constructor(
        public id: number = 0,
        public count: number = 0,
        public statusID: number = 0,
        public statusName: string = '',
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }
}
