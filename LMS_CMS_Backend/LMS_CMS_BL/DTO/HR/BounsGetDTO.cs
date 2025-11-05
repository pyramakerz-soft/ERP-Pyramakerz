using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class BounsGetDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public int NumberOfBounsDays { get; set; }
        public int Hours { get; set; }
        public int Minutes { get; set; }
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long BounsTypeID { get; set; }
        public string BounsTypeName { get; set; }

    }
}
