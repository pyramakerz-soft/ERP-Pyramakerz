
export class SocialInsurance {
  constructor(
    public id: number = 0,
    public insuranceOfficeName: string = '',
    public createdDate: string = '',        
    public insertedByUserId :number =0,
  ) {}
}

export class SocialInsuranceCreate {
  insuranceOfficeName: string = '';
}

