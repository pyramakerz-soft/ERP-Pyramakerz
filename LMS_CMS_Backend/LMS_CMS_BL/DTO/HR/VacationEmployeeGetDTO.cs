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
    public class VacationEmployeeGetDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public string? Notes { get; set; }
        public bool HalfDay { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public int Balance { get; set; }
        public decimal used { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long VacationTypesID { get; set; }
        public string VacationTypesName { get; set; }
    }
}
