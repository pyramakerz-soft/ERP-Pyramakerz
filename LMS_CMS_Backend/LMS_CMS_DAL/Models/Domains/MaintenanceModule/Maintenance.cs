using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.MaintenanceModule
{
    public class Maintenance : AuditableEntity
    {

        public long ID { get; set; }


        public DateOnly Date { get; set; }

        [ForeignKey("Item")]
        public long ItemID { get; set; }
        public MaintenanceItem Item { get; set; }

        [ForeignKey("MaintenanceEmployee")]
        public long? MaintenanceEmployeeID { get; set; }
        public MaintenanceEmployee? MaintenanceEmployee { get; set; }

        [ForeignKey("Company")]
        public long? CompanyID { get; set; }
        public MaintenanceCompany? Company { get; set; }

      
        public decimal Cost { get; set; }

    
        public string? Note { get; set; }

    }
}
