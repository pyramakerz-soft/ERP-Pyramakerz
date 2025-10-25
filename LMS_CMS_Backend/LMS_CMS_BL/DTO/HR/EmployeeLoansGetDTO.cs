using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class EmployeeLoansGetDTO
    {
        public long ID { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Amount { get; set; }
    }
}
