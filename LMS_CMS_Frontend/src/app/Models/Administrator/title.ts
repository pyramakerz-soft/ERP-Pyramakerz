
export class Title {
constructor (
  public id: number = 0,
  public name: string = '',
  public date:string = '',
  public departmentID: number = 0,
  public departmentName: string= '',
  public insertedByUserId?: number
 ) {}
}