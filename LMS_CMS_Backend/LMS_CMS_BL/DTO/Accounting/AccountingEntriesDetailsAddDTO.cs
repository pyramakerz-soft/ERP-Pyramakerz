using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class AccountingEntriesDetailsAddDTO
    {
        public decimal? CreditAmount { get; set; }
        public decimal? DebitAmount { get; set; }
        public string? Note { get; set; }
        public long AccountingTreeChartID { get; set; }
        public long AccountingEntriesMasterID { get; set; }
        public long? SubAccountingID { get; set; }
    }
}
