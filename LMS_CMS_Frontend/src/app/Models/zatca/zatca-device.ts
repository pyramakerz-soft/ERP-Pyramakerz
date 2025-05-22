export class ZatcaDevice {
  constructor(
    public id: number = 0,
    public pcName: string = '',
    public serialNumber: string = '',
    public schoolId: number = 0,
    public school: string = '',
    public certificateDate: string | null = null
  ) {}
}