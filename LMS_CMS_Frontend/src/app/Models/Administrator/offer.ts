
export class Offer {
  constructor(
    public id: number = 0,
    public departmentName: string = '',
    public titleName: string = '',
    public timeLogged: Date = new Date(),
    public uploadedFilePath: string = '',
    public fileName: string = ''
  ) {}
}