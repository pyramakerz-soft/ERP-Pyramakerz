using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class EvaluationReportDto
    {
        public DateOnly Date { get; set; }
        public List<EvaluationGroupDto> EvaluationEmployeeQuestionGroups { get; set; } = new List<EvaluationGroupDto>();
        public List<EvaluationBookCorrectionDto> EvaluationEmployeeStudentBookCorrections { get; set; } = new List<EvaluationBookCorrectionDto>();
    }

    public class EvaluationGroupDto
    {
        public long Id { get; set; }
        public string EnglishTitle { get; set; }
        public string ArabicTitle { get; set; }
        public List<EvaluationQuestionDto> EvaluationEmployeeQuestions { get; set; } = new List<EvaluationQuestionDto>();
    }

    public class EvaluationQuestionDto
    {
        public long Id { get; set; }
        public decimal Mark { get; set; }
        public string Note { get; set; }
        public long EvaluationTemplateGroupQuestionID { get; set; }
        public string QuestionEnglishTitle { get; set; }
        public string QuestionArabicTitle { get; set; }
        public string Average { get; set; }
    }

    public class EvaluationBookCorrectionDto
    {
        public long Id { get; set; }
        public int State { get; set; }
        public string Note { get; set; }
        public long StudentID { get; set; }
        public string StudentEnglishName { get; set; }
        public string StudentArabicName { get; set; }
        public long EvaluationBookCorrectionID { get; set; }
        public string EvaluationBookCorrectionEnglishName { get; set; }
        public string EvaluationBookCorrectionArabicName { get; set; }
        public string AverageStudent { get; set; }
    }
}
