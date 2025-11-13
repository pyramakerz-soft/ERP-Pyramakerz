using LMS_CMS_BL.DTO.LMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class LinFileTypeDataDTO
    {
       public List<BankGetDTO> bankGetDTOs { get; set; }
        public List<SaveGetDTO> saveGetDTO { get; set; }
        public List<SupplierGetDTO> supplierGetDTO { get; set; }
        public List<DebitGetDTO> debitGetDTO { get; set; }
        public List<CreditGetDTO> creditGetDTO { get; set; }
        public List<IncomeGetDTO> incomeGetDTO { get; set; }
        public List<OutcomeGetDTO> outcomeGetDTO { get; set; }
        public List<AssetGetDTO> assetGetDTO { get; set; }
        public List<Employee_GetDTO> employee_GetDTO { get; set; }
        public List<TuitionFeesTypeGetDTO> tuitionFeesTypeGetDTO { get; set; }
        public List<TuitionDiscountTypeGetDTO> tuitionDiscountTypeGetDTO { get; set; }
        public List<StudentGetDTO> studentGetDTO { get; set; }
    }
}
