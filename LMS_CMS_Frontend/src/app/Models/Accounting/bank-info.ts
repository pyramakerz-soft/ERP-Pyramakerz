export class BankInfo {
  constructor(
    public id: number = 0,
    public bankName: string = '',
    public bankBranch: string = '',
    public insertedByUserId: number = 0,
    public insertedAt: number = 0
  ) {}
}