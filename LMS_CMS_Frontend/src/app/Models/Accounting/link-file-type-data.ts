import { Employee } from "../Employee/employee";
import { Student } from "../student";
import { Asset } from "./asset";
import { Bank } from "./bank";
import { Credit } from "./credit";
import { Debit } from "./debit";
import { Income } from "./income";
import { Outcome } from "./outcome";
import { Saves } from "./saves";
import { Supplier } from "./supplier";
import { TuitionDiscountTypes } from "./tuition-discount-types";
import { TuitionFeesType } from "./tuition-fees-type";

export class LinkFileTypeData {
        constructor(
        public bankGetDTOs: Bank[] = [],
        public saveGetDTO: Saves[] = [],
        public supplierGetDTO: Supplier[] = [],
        public debitGetDTO: Debit[] = [],
        public creditGetDTO: Credit[] = [],
        public incomeGetDTO: Income[] = [],
        public outcomeGetDTO: Outcome[] = [],
        public assetGetDTO: Asset[] = [],
        public employee_GetDTO: Employee[] = [],
        public tuitionFeesTypeGetDTO: TuitionFeesType[] = [],
        public tuitionDiscountTypeGetDTO: TuitionDiscountTypes[] = [],
        public studentGetDTO: Student[] = [],
    ) { }
}
