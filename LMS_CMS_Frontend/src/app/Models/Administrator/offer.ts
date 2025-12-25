
export class Offer {
  constructor(
    public id: number = 0,
    public departmentID: number = 0,
    public titleID: number = 0,

    public departmentName: string = '',
    public titleName: string = '',

    public timeLogged: Date = new Date(),

    public uploadedFilePath: string = '',
    public fileName: string = '',
    public insertedByUserId: number = 0,
  ) {}
}
export interface OfferAddDto {
  departmentID: number;
  titleID: number;
  uploadedFile?: File | null;
}

