using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class Location : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string Name { get; set; }
        public double Range { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public ICollection<EmployeeClocks> EmployeeClocks { get; set; } = new HashSet<EmployeeClocks>();
        public ICollection<EmployeeLocation> EmployeeLocation { get; set; } = new HashSet<EmployeeLocation>();

    }
}
