export class EmployeeClocks {
  constructor(
    public id: number = 0,
    public date: string = '',
    public employeeID: number = 0,
    public employeeEnName: string = '',
    public employeeArName: string = '',
    public clockIn: string | null = null,
    public clockOut: string | null = null,
    public latitude: number = 0,
    public longitude: number = 0,
    public locationID: number = 0,
    public locationName: string = '',
  ) {}
}

