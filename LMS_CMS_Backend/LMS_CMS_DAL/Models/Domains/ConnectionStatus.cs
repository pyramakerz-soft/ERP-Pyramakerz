using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains
{
    public class ConnectionStatus
    {
        public long ID { get; set; }
        public string En_Title { get; set; }
        public string Ar_Title { get; set; }
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
        public ICollection<Parent> Parents { get; set; } = new List<Parent>();
        public ICollection<Student> Students { get; set; } = new List<Student>();

    }
}
