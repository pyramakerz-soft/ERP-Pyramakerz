import { AppointmentGrade } from "./appointment-grade";
import { AppointmentParent } from "./appointment-parent";

export class Appointment {
        constructor(
        public id: number = 0,
        public title: string = '',        
        public date: string = '',        
        public dueDateToParentToAccept: string = '',  
        public schoolID: number = 0,
        public schoolName: string = '',
        public gradeIds :number[]=[],
        public appointmentGrades :AppointmentGrade[]=[],
        public appointmentParents :AppointmentParent[]=[],
        public insertedByUserId: number = 0,
        public insertedAt: string = '',
    ) { }

}
