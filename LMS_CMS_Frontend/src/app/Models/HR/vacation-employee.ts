export class VacationEmployee {
  constructor(
    public id: number = 0,
    public date: string = '',
    public notes: string = '',
    public dateFrom: string = '',
    public dateTo: string | null= '',
    public halfDay: boolean = false,
    public used: number = 0,
    public balance: number = 0,
    public remains: number = 0,
    public employeeID: number = 0,
    public employeeEnName: string = '',
    public employeeArName: string = '',
    public vacationTypesID: number = 0,
    public vacationTypesName: string = ''
  ) {}
}

