
export class DeductionCategory {
 constructor(
  public id: number = 0,
  public enNameDeductionCategory: string = '',
  public arNameDeductionCategory: string = '',
  public insertedByUserId :number =0,
  ) {}
}

export class DeductionCategoryCreate {
  public enNameDeductionCategory: string = '';
  public arNameDeductionCategory: string = '';
}
