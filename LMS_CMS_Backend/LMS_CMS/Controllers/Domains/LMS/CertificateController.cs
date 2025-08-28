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
using static System.Runtime.InteropServices.JavaScript.JSType;

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

        [HttpGet("ByStudentId/{SchoolId}/{StudentId}/{DateFrom}/{DateTo}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Building" }
        )]
        public async Task<IActionResult> GetById(long SchoolId, long StudentId, DateOnly DateFrom, DateOnly DateTo)
        {
            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // DTO initialization
            var certificateGetDTO = new CertificateGetDTO
            {
                CertificateSubjects = new List<CertificateSubject>()
            };

            // Check if student exists
            var student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
            if (student == null)
                return BadRequest("There is no student with this ID");

            DateTime dateFrom = DateFrom.ToDateTime(new TimeOnly(0, 0));
            DateTime dateTo = DateTo.ToDateTime(new TimeOnly(0, 0));

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository
                .First_Or_Default(s => s.StudentID == StudentId &&
                                       s.IsDeleted != true &&
                                       s.Classroom.IsDeleted != true &&
                                       DateTime.Parse(s.Classroom.AcademicYear.DateFrom) >= dateFrom &&
                                       DateTime.Parse(s.Classroom.AcademicYear.DateTo) <= dateTo &&
                                       s.Classroom.AcademicYear.SchoolID == SchoolId);

            if (studentClassroom == null)
                return BadRequest("This student is not enrolled in a classroom for the current academic year.");

            // All Subjects for this student
            var studentClassroomSubjects = await Unit_Of_Work.studentClassroomSubject_Repository
                .Select_All_With_IncludesById<StudentClassroomSubject>(
                    f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID && !f.Hide);

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

            foreach (var subjectId in subjectIds)
            {
                var subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == subjectId && s.IsDeleted != true);
                if (subject == null) continue;


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

                    var allAssignments = specificAssignments.Select(a => a.Assignment)
                        .Concat(normalAssignments)
                        .GroupBy(a => a.ID)
                        .Select(g => g.First())
                        .ToList();

                    // Sum assignment marks
                    foreach (var assignment in allAssignments)
                    {
                        var assignmentStudent = Unit_Of_Work.assignmentStudent_Repository
                            .First_Or_Default(a => a.StudentClassroomID == studentClassroom.ID &&
                                                   a.AssignmentID == assignment.ID &&
                                                   a.IsDeleted != true);

                        if (assignmentStudent != null)
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

                        if (studentDirectMark != null)
                        {
                            sumPercentageDegree += ((float)studentDirectMark.Degree / mark.Mark);
                        }
                    }

                    int totalItems = directMarks.Count + allAssignments.Count;
                    float avgDegree = totalItems > 0 ? (sumPercentageDegree / totalItems) * swt.Value : 0;


                    var certificateSubjectObject = new CertificateSubject();
                    certificateSubjectObject.Degree = avgDegree;
                    certificateSubjectObject.Mark = swt.Value;
                    certificateSubjectObject.WeightTypeArName = swt.WeightType.ArabicName;
                    certificateSubjectObject.WeightTypeEnName = swt.WeightType.EnglishName;
                    certificateSubjectObject.WeightTypeId = swt.WeightType.ID;
                    certificateSubjectObject.SubjectID = subject.ID;
                    certificateSubjectObject.SubjectAr_name = subject.ar_name;
                    certificateSubjectObject.SubjectEn_name = subject.en_name;

                    certificateSubjects.Add(certificateSubjectObject);
                }

            }

            return Ok(new { SubjectDTO = SubjectDTO, Header = WeightTypeDTO, cells = certificateSubjects });
        }

    }
}
