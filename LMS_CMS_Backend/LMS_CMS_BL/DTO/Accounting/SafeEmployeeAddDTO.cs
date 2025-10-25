using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class SafeEmployeeAddDTO
    { 
        public List<long> EmployeeIDs { get; set; }
        public long SaveID { get; set; }
    }
}
