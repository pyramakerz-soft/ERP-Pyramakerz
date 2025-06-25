// tax-issuer.model.ts
export class TaxIssuer {
    constructor(
        public id: string = '',
        public type: string = '',
        public name: string = '',
        public activityCode: string = '',
        public branchID: string = '',
        public country: string = '',
        public governate: string = '',
        public regionCity: string = '',
        public street: string = '',
        public buildingNumber: string = '',
        public postalCode: string = '',
        public floor: string = '',
        public room: string = '',
        public landMark: string = '',
        public additionalInfo: string = '',
        public insertedByUserId: number = 0,
        public insertedByOctaId: number | null = null,
        public insertedAt: string = '',
        public updatedByUserId: number | null = null,
        public updatedByOctaId: number | null = null,
        public updatedAt: string = '',
        public deletedByUserId: number | null = null,
        public deletedByOctaId: number | null = null,
        public deletedAt: string | null = null,
        public isDeleted: boolean | null = null
    ) {}
}