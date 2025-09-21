export class Maintenance {
  constructor(
  public id: number = 0,
  public date: string = '',
  public fromDate: string = '',
  public toDate: string  = '',
  public itemID: number= 0,
  public itemArabicName: string = '',
  public itemEnglishName: string= '',
  public companyEnglishName: string | null=null,
  public companyArabicName: string | null = null,
  public companyID: number | null = null,
  public employeeEnglishName: string | null = null ,
  public employeeArabicName: string | null = null ,
  public maintenanceEmployeeID: number | null = null ,
  public cost: number | null = null,
  public costRawString: string = '', // Add this line to store the raw string
  public note: string = '',
  public en_Name: string = '',
  public ar_Name: string = '',
  public insertedByUserId: number = 0,
  ){}
}