using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class SafeEmployeeGetDTO
    {
        public long ID { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnglishName { get; set; }
        public string EmployeeArabicName { get; set; }
        public long SaveID { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
