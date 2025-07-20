using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetById(long SchoolId, long StudentId, string DateFrom , string DateTo)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            //Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
            //if (student == null)
            //{
            //    return BadRequest("There is no student with this ID");
            //}

            //StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository
            //    .First_Or_Default(s => s.StudentID == StudentId && s.IsDeleted != true && s.Classroom.IsDeleted != true && s.Classroom.AcademicYear.IsActive == true);

            //if (studentClassroom == null)
            //{
            //    return BadRequest("This student is not enrolled in a classroom for the current academic year.");
            //}

            //List<StudentClassroomSubject> studentClassroomSubject = await Unit_Of_Work.studentClassroomSubject_Repository
            //    .Select_All_With_IncludesById<StudentClassroomSubject>(
            //        f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID
            //    );

            //if (studentClassroomSubject == null || studentClassroomSubject.Count == 0)
            //{
            //    return NotFound();
            //}

            //List<long> subjectIds = studentClassroomSubject.Select(s => s.SubjectID).Distinct().ToList();
            //List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(s => subjectIds.Contains(s.ID)).ToList();
            //List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects);
            //string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            //foreach (var subject in subjectsDTO)
            //{
            //    if (!string.IsNullOrEmpty(subject.IconLink))
            //    {
            //        subject.IconLink = $"{serverUrl}{subject.IconLink.Replace("\\", "/")}";
            //    }
            //}



            return Ok();
        }

    }
}
