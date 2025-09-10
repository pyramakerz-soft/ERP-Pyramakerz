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
    public class AnnualVacationEmployeeGetDTO
    {
        public long ID { get; set; }
        public int Balance { get; set; }
        public double used { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long VacationTypesID { get; set; }
        public string VacationTypeName { get; set; }
    }
}
