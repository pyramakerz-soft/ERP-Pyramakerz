
export class AppointmentDocument {
 constructor(
  public id: number = 0,
  public documentName: string = '',
  public appointmentDate: string = '',   
  public insertedByUserId :number =0,
  ) {}
}

export class  AppointmentDocumentCreate {
 public documentName: string = '';
}

