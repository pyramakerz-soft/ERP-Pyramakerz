using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class AccountingEntriesMasterPutDTO
    {
        public long ID { get; set; }
        public string DocNumber { get; set; }
        public DateOnly Date { get; set; }
        public string? Notes { get; set; }
        public long AccountingEntriesDocTypeID { get; set; }
        public List<AccountingEntriesDetailsPutDTO>? AccountingEntriesDetails { get; set; }
        public List<AccountingEntriesDetailsPutDTO>? UpdatedDetails { get; set; }
        public List<AccountingEntriesDetailsAddDTO>? NewDetails { get; set; }
    }
}
