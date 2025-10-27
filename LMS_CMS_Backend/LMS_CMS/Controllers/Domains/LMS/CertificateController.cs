 using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public CertificateController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpGet("ByStudentId/{SchoolId}/{ClassId}/{StudentId}/{DateFrom}/{DateTo}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] {"octa", "employee", "student", "parent" },
            pages: new[] { "Certificate" }
        )]
        public async Task<IActionResult> GetById(long SchoolId, long ClassId, long StudentId, DateOnly DateFrom, DateOnly DateTo)
        {
            try
            {
                var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

                // Check if student exists
                var student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
                if (student == null)
                    return BadRequest("There is no student with this ID");

                // Get classroom for this student
                var studentClassroom = Unit_Of_Work.studentClassroom_Repository
                    .First_Or_Default(s => s.StudentID == StudentId &&
                                           s.IsDeleted != true &&
                                           s.Classroom != null &&
                                           s.ClassID == ClassId &&
                                           s.Classroom.IsDeleted != true &&
                                           s.Classroom.AcademicYear != null &&
                                           s.Classroom.AcademicYear.DateFrom <= DateFrom &&
                                           s.Classroom.AcademicYear.DateTo >= DateTo &&
                                           s.Classroom.AcademicYear.SchoolID == SchoolId);

                if (studentClassroom == null)
                    return BadRequest("This student is not enrolled in a classroom for the current academic year.");

                // All Subjects for this student
                var studentClassroomSubjects = await Unit_Of_Work.studentClassroomSubject_Repository
                    .Select_All_With_IncludesById<StudentClassroomSubject>(
                        f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID && f.Subject.IsDeleted != true && f.Subject.HideFromGradeReport == false && !f.Hide);

                if (studentClassroomSubjects == null || !studentClassroomSubjects.Any())
                    return NotFound("No subjects found for this student.");

                var subjectIds = studentClassroomSubjects.Select(s => s.SubjectID).Distinct().ToList();
                List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(s => subjectIds.Contains(s.ID));
                List<SubjectGetDTO> SubjectDTO= mapper.Map<List<SubjectGetDTO>>(subjects);  // first column
                  
                // All Weight types for this subject
                List<SubjectWeightType> AllsubjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository
                    .Select_All_With_IncludesById<SubjectWeightType>(s => subjectIds.Contains(s.SubjectID) && s.IsDeleted != true && s.WeightType.IsDeleted != true,
                        query => query.Include(d => d.WeightType));
                var WeightTypeIds = AllsubjectWeightTypes.Select(a=>a.WeightTypeID).Distinct().ToList();
                List<WeightType> AllWeightType = Unit_Of_Work.weightType_Repository.FindBy(w => WeightTypeIds.Contains(w.ID));
                List<WeightTypeGetDTO> WeightTypeDTO =mapper.Map<List<WeightTypeGetDTO>>(AllWeightType);     //Header

                List<CertificateSubject> certificateSubjects = new List<CertificateSubject>(); // The Data Fill In cell
                List<CertificateSubjectTotalMark> certificateSubjectTotalMark = new List<CertificateSubjectTotalMark>(); // total marks in last column

                foreach (var subjectId in subjectIds)
                {
                    var subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == subjectId && s.IsDeleted != true);
                    if (subject == null) continue;

                    var subjectTotalMark =  new CertificateSubjectTotalMark();
                    subjectTotalMark.SubjectID = subject.ID;
                    subjectTotalMark.SubjectEn_name = subject.en_name;
                    subjectTotalMark.SubjectAr_name = subject.ar_name;
                    subjectTotalMark.Degree =0;
                    subjectTotalMark.Mark = 0;

                    // Weight types for this subject
                    List<SubjectWeightType> subjectWeightTypes = await Unit_Of_Work.subjectWeightType_Repository.Select_All_With_IncludesById<SubjectWeightType>(s => s.SubjectID == subjectId && s.IsDeleted != true && s.WeightType.IsDeleted!= true,
                            query => query.Include(d => d.WeightType));

                    foreach (var swt in subjectWeightTypes)
                    {
                        float sumPercentageDegree = 0;

                        // Get Assignments for this subject & weight type
                        var specificAssignments = await Unit_Of_Work.assignmentStudentIsSpecific_Repository
                            .Select_All_With_IncludesById<AssignmentStudentIsSpecific>(
                                d => d.IsDeleted != true &&
                                     d.StudentClassroomID == studentClassroom.ID &&
                                     d.Assignment != null && 
                                     d.Assignment.IsDeleted != true &&
                                     d.Assignment.SubjectID == subject.ID &&
                                     d.Assignment.SubjectWeightTypeID == swt.WeightTypeID &&
                                     d.Assignment.OpenDate >= DateFrom &&
                                     d.Assignment.OpenDate <= DateTo);

                        var normalAssignments = await Unit_Of_Work.assignment_Repository
                            .Select_All_With_IncludesById<Assignment>(
                                d => d.IsDeleted != true &&
                                     d.SubjectID == subject.ID &&
                                     !d.IsSpecificStudents &&
                                     d.OpenDate >= DateFrom &&
                                     d.OpenDate <= DateTo);
                         
                        var allAssignments = specificAssignments
                            .Where(a => a.Assignment != null)
                            .Select(a => a.Assignment)
                            .Concat(normalAssignments)
                            .Where(a => a != null)
                            .GroupBy(a => a.ID)
                            .Select(g => g.First())
                            .ToList();
                         
                        // Sum assignment marks
                        foreach (var assignment in allAssignments.Where(a => a != null))
                        {
                            var assignmentStudent = Unit_Of_Work.assignmentStudent_Repository
                                .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                       a.AssignmentID == assignment.ID &&
                                                       a.Degree != null &&
                                                       a.IsDeleted != true);

                            if (assignmentStudent?.Degree != null && assignment?.Mark != null && assignment.Mark > 0)
                            {
                                sumPercentageDegree += ((float)assignmentStudent.Degree / assignment.Mark);
                            }
                        }

                        // Get direct marks
                        var directMarks = Unit_Of_Work.directMark_Repository
                            .FindBy(a => a.SubjectID == subjectId &&
                                         a.IsDeleted != true &&
                                         a.SubjectWeightTypeID == swt.WeightTypeID &&
                                         a.Date >= DateFrom &&
                                         a.Date <= DateTo).ToList();

                        foreach (var mark in directMarks)
                        {
                            var studentDirectMark = Unit_Of_Work.directMarkClassesStudent_Repository
                                .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                       a.DirectMarkID == mark.ID &&
                                                       a.IsDeleted != true);

                            if (studentDirectMark?.Degree != null && mark?.Mark != null && mark.Mark > 0)
                            {
                                sumPercentageDegree += ((float)studentDirectMark.Degree / mark.Mark);
                            }
                        } 

                        int totalItems = directMarks.Count + allAssignments.Count;
                        float avgDegree = totalItems > 0 ? (sumPercentageDegree / totalItems) * swt.Weight : 0;


                        var certificateSubjectObject = new CertificateSubject();
                        certificateSubjectObject.Mark = swt.Weight;

                        float weight =avgDegree;
                        int integerPart = (int)Math.Floor(weight);
                        float decimalPart = weight - integerPart;

                        if (decimalPart > 0.5)
                        {
                            certificateSubjectObject.Degree = integerPart + 1;
                        }
                        else if (decimalPart < 0.5)
                        {
                            certificateSubjectObject.Degree = integerPart;
                        }
                        else // decimalPart == 0.5
                        {
                            certificateSubjectObject.Degree = integerPart + 0.5f;
                        }
                        //certificateSubjectObject.Degree = avgDegree;

                        certificateSubjectObject.WeightTypeArName = swt.WeightType.ArabicName;
                        certificateSubjectObject.WeightTypeEnName = swt.WeightType.EnglishName;
                        certificateSubjectObject.WeightTypeId = swt.WeightType.ID;
                        certificateSubjectObject.SubjectID = subject.ID;
                        certificateSubjectObject.SubjectAr_name = subject.ar_name;
                        certificateSubjectObject.SubjectEn_name = subject.en_name;

                        certificateSubjects.Add(certificateSubjectObject);
                        subjectTotalMark.Mark += certificateSubjectObject.Mark;
                        subjectTotalMark.Degree += certificateSubjectObject.Degree;
                    }
                    certificateSubjectTotalMark.Add(subjectTotalMark);
                } 

                foreach (var percentage in certificateSubjectTotalMark)
                {
                    if (percentage.Mark == 0)
                        percentage.Percentage = 0;  
                    else
                        percentage.Percentage = (percentage.Degree / percentage.Mark) * 100;
                }

                return Ok(new { SubjectDTO = SubjectDTO, Header = WeightTypeDTO, cells = certificateSubjects , LastColumn = certificateSubjectTotalMark});
            }
            catch (Exception ex)
            {
                Console.WriteLine( new { error = ex.Message, stack = ex.StackTrace });
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace});
            }

        }

    }
}
