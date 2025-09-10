using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DailyPerformanceReportDTO
    {
        public DateOnly Date { get; set; } // التاريخ
        public long SchoolId { get; set; } // معرف المدرسة
        public long GradeId { get; set; } // معرف الصف
        public long ClassroomId { get; set; } // معرف الصف
        public string ClassroomName { get; set; } // اسم الفصل
        public long StudentId { get; set; } // معرف الطالب
        public string EnglishNameStudent { get; set; } // اسم الطالب بالإنجليزي
        public string ArabicNameStudent { get; set; } // اسم الطالب بالعربي
       
        public string PerformanceTypeEn { get; set; } // نوع الأداء بالإنجليزي
        public string PerformanceTypeAr { get; set; } // نوع الأداء بالعربي
        public string Comment { get; set; } // التعليق
       
    }
}
