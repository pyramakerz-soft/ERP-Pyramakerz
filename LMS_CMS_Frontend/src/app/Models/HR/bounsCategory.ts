
export class BounsCategory {
 constructor(
  public id: number = 0,
  public enNameCategory: string = '',
  public arNameCategory: string = '',
  public insertedByUserId :number =0,
  ) {}
}

export class BounsCategoryCreate {
  public enNameCategory: string = '';
  public arNameCategory: string = '';
}
