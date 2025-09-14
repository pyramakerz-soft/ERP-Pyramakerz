using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class LocationAddDTO
    {
        public long? ID { get; set; }
        public string Name { get; set; }
        public double Range { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
