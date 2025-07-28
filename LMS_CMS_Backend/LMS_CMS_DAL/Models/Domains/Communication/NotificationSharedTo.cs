using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Communication
{
    public class NotificationSharedTo : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public long UserID { get; set; }
        public bool NotifiedOrNot { get; set; }

        [ForeignKey("Notification")]
        public long NotificationID { get; set; }
        public Notification Notification { get; set; }

        [ForeignKey("UserType")]
        public long UserTypeID { get; set; }
        public UserType UserType { get; set; }
    }
}
