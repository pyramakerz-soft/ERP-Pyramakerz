using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class InstallmentDeductionDetailsAddDTO
    {
        public decimal Amount { get; set; }
        public string Date { get; set; }
        public long InstallmentDeductionMasterID { get; set; }
        public long FeeTypeID { get; set; }
    }
}
