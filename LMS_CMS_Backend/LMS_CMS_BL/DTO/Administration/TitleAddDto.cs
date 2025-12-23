using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class TitleAddDto
    {
        [Required]
        public string Name { get; set; }
        public DateTime? Date { get; set; }
        public long DepartmentID { get; set; }  
    }

    // TitleGetDto.cs
    public class TitleGetDto
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public DateTime? Date { get; set; }
        public long? DepartmentID { get; set; }

        [JsonIgnore] 
        public string? DepartmentName { get; set; }

    }
}
