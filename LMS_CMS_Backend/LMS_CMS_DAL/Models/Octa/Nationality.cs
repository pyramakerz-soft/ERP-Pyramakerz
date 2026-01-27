using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Octa
{
    public class Nationality
    {
        [Key]
        public long ID { get; set; }
        public string Name { get; set; }
        public string ArName { get; set; }

        [ForeignKey("Country")]
        public long CountryID { get; set; }
        public Country Country { get; set; }
        public ICollection<RegisteredEmployee> RegisteredEmployees { get; set; } = new HashSet<RegisteredEmployee>();

    }
}
