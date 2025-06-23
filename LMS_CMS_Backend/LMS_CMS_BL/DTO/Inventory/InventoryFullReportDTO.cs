using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryFullReportDTO
    {
        public InventoryNetSummaryDTO Summary { get; set; }
        public List<InventoryNetTransactionDTO> Transactions { get; set; }
    }

}
