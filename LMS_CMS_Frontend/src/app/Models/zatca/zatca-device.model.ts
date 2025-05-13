// zatca-device.model.ts
export class ZatcaDevice {
  constructor(
    public id: number = 0,
    public pcName: string = '',
    public serialNumber: string = '',
    public school: String = '',
    public certificateDate: string | null = null,
  ) {}
}

export interface ZatcaDeviceForm {
  id: number;
  pcName: string;
  serialNumber: string;
  schoolId: number;
}