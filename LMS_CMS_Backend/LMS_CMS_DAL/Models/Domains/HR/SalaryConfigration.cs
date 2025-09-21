using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class SalaryConfigration
    {
        [Key]
        public long ID { get; set; }
        public int StartDay { get; set; }
        public bool FromPreviousMonth { get; set; }
    }
}
