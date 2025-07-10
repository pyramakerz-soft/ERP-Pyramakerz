using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class TimeTableAddDTO
    {
        public long SchoolID { get; set; }
        public string name { get; set; }
        public bool IsFavourite { get; set; }
    }
}
