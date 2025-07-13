import { GradeGroupDTO } from "./grade-group-dto";

export class TimeTableDayGroupDTO {
    constructor(
       public dayId: number,
       public dayName: string,
       public grades: GradeGroupDTO[],
    ) { }
}
