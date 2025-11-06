using LMS_CMS_DAL.Models.Domains.ViolationModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Violation
{
    public class ViolationTypeAddDTO
    {
        public string Name { get; set; }
        public ICollection<long> EmployeeTypeIds { get; set; }

    }
}
