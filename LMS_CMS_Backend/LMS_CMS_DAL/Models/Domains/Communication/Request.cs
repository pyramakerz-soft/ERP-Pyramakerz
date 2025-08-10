using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Communication
{
    public class Request : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Message { get; set; }
        public string? Link { get; set; }
        public string? FileLink { get; set; }
        public bool SeenOrNot { get; set; }
        public bool ForwardedOrNot { get; set; }
        public bool? ApprovedOrNot { get; set; }
        public long SenderID { get; set; }
        public long ReceiverID { get; set; }
        public long? TransfereeID { get; set; }

        [ForeignKey("SenderUserType")]
        public long SenderUserTypeID { get; set; }
        public UserType SenderUserType { get; set; }

        [ForeignKey("ReceiverUserType")]
        public long ReceiverUserTypeID { get; set; }
        public UserType ReceiverUserType { get; set; }
    }
}
