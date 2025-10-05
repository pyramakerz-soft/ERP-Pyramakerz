using Amazon.S3;
using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.Drawing;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly FileImageValidationService _fileImageValidationService;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService; 
        private readonly FileUploadsService _fileService;

        public SubjectController(DbContextFactoryService dbContextFactory, IMapper mapper, FileImageValidationService fileImageValidationService, 
            CheckPageAccessService checkPageAccessService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _fileImageValidationService = fileImageValidationService;
            _checkPageAccessService = checkPageAccessService; 
            _fileService = fileService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Subject> subjects = await Unit_Of_Work.subject_Repository.Select_All_With_IncludesById<Subject>(
                    f => f.IsDeleted != true,
                    query => query.Include(emp => emp.Grade),
                    query => query.Include(emp => emp.Grade.Section),
                    query => query.Include(emp => emp.Grade.Section.school),
                    query => query.Include(emp => emp.SubjectCategory)
                    );

            if (subjects == null || subjects.Count == 0)
            {
                return NotFound();
            }

            List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects);
             
            foreach (var subject in subjectsDTO)
            {
                subject.IconLink = _fileService.GetFileUrl(subject.IconLink, Request);
            }

            return Ok(subjectsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByClassroom/{classId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Subject" }
        )]
        public async Task<IActionResult> GetAsync(long classId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ClassroomSubject> classroomSubjects = await Unit_Of_Work.classroomSubject_Repository.Select_All_With_IncludesById<ClassroomSubject>(
                    f => f.IsDeleted != true && f.ClassroomID == classId && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true,
                    query => query.Include(emp => emp.Subject),
                    query => query.Include(emp => emp.Classroom),
                    query => query.Include(emp => emp.Teacher),
                    query => query.Include(emp => emp.ClassroomSubjectCoTeachers.Where(c => c.IsDeleted != true)).ThenInclude(c => c.CoTeacher)
                    );

            if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                return NotFound();
            }

            List<long> classroomSubjectids = classroomSubjects.Select(s=>s.SubjectID).Distinct().ToList();
            List<Subject> subjects = await Unit_Of_Work.subject_Repository.Select_All_With_IncludesById<Subject>(
                  f => f.IsDeleted != true && classroomSubjectids.Contains(f.ID),
                  query => query.Include(emp => emp.Grade),
                  query => query.Include(emp => emp.Grade.Section),
                  query => query.Include(emp => emp.Grade.Section.school),
                  query => query.Include(emp => emp.SubjectCategory)
                  );

            if (subjects == null || subjects.Count == 0)
            {
                return NotFound();
            }

            List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects);

            return Ok(subjectsDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByGrade/{gradeId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetByGrade(long gradeId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Subject> subjects = await Unit_Of_Work.subject_Repository.Select_All_With_IncludesById<Subject>(
                    f => f.IsDeleted != true && f.GradeID == gradeId,
                    query => query.Include(emp => emp.Grade),
                    query => query.Include(emp => emp.Grade.Section),
                    query => query.Include(emp => emp.Grade.Section.school),
                    query => query.Include(emp => emp.SubjectCategory)
                    );

            if (subjects == null || subjects.Count == 0)
            {
                return NotFound();
            }

            List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects);
             
            foreach (var subject in subjectsDTO)
            {
                subject.IconLink = _fileService.GetFileUrl(subject.IconLink, Request);
            }

            return Ok(subjectsDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Subject ID");
            }

            Subject subject = await Unit_Of_Work.subject_Repository.FindByIncludesAsync(
                t => t.IsDeleted != true && t.ID == id, 
                query => query.Include(e => e.Grade),
                query => query.Include(emp => emp.Grade.Section),
                query => query.Include(emp => emp.Grade.Section.school),
                query => query.Include(e => e.SubjectCategory)
                );


            if (subject == null)
            {
                return NotFound();
            }

            SubjectGetDTO subjectDTO = mapper.Map<SubjectGetDTO>(subject);
             
            if (!string.IsNullOrEmpty(subjectDTO.IconLink))
            {
                subjectDTO.IconLink = _fileService.GetFileUrl(subject.IconLink, Request);
            }

            return Ok(subjectDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpPost] 
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> Add([FromForm]SubjectAddDTO NewSubject)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewSubject == null)
            {
                return BadRequest("Subject cannot be null");
            }
            if (NewSubject.en_name == null)
            {
                return BadRequest("the name cannot be null");
            }
            if (NewSubject.ar_name == null)
            {
                return BadRequest("the name cannot be null");
            }
            if (NewSubject.GradeID != 0)
            {
                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(g=>g.ID==NewSubject.GradeID&&g.IsDeleted!=true);
                if (grade == null)
                {
                    return BadRequest("No Grade with this ID");
                }
            }

            if (NewSubject.SubjectCategoryID != 0)
            {
                SubjectCategory subjectCategory = Unit_Of_Work.subjectCategory_Repository.First_Or_Default(g => g.ID == NewSubject.SubjectCategoryID && g.IsDeleted != true);
                if (subjectCategory == null)
                {
                    return BadRequest("No Subject Category with this ID");
                }
            }

            if (NewSubject.IconFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(NewSubject.IconFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            if(NewSubject.AssignmentCutOffDatePercentage > 100 || NewSubject.AssignmentCutOffDatePercentage < 0)
            {
                return BadRequest("Percentage must be between 0 and 100");
            } 

            Subject subject = mapper.Map<Subject>(NewSubject);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            subject.IconLink = "test";
            if (userTypeClaim == "octa")
            {
                subject.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                subject.InsertedByUserId = userId;
            }
            Unit_Of_Work.subject_Repository.Add(subject);
            Unit_Of_Work.SaveChanges();

            if (NewSubject.IconFile != null)
            {
                subject.IconLink = await _fileService.UploadFileAsync(NewSubject.IconFile, "LMS/Subject", subject.ID, HttpContext); 
                Unit_Of_Work.subject_Repository.Update(subject);
                Unit_Of_Work.SaveChanges();
            } 

            return Ok(NewSubject);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> Edit([FromForm] SubjectPutDTO EditSubject)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (EditSubject == null)
            {
                return BadRequest("Subject cannot be null");
            }

            if (EditSubject.GradeID != 0)
            {
                Grade grade = Unit_Of_Work.grade_Repository.Select_By_Id(EditSubject.GradeID);
                if (grade == null || grade.IsDeleted==true)
                {
                    return BadRequest("No Grade with this ID");
                }
            }

            if (EditSubject.SubjectCategoryID != 0)
            {
                SubjectCategory subjectCategory = Unit_Of_Work.subjectCategory_Repository.Select_By_Id(EditSubject.SubjectCategoryID);
                if (subjectCategory == null || subjectCategory.IsDeleted == true)
                {
                    return BadRequest("No Subject Category with this ID");
                }
            }

            if (EditSubject.IconFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(EditSubject.IconFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            if (EditSubject.AssignmentCutOffDatePercentage > 100 || EditSubject.AssignmentCutOffDatePercentage < 0)
            {
                return BadRequest("Percentage must be between 0 and 100");
            }

            Subject SubjectExists = Unit_Of_Work.subject_Repository.Select_By_Id(EditSubject.ID);
             
            if (SubjectExists == null || SubjectExists.IsDeleted == true)
            {
                return NotFound("No Subject with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Subject", roleId, userId, SubjectExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            } 

            if (EditSubject.IconFile != null)
            {
                EditSubject.IconLink = await _fileService.ReplaceFileAsync(
                    EditSubject.IconFile,
                    SubjectExists.IconLink,
                    "LMS/Subject",
                    SubjectExists.ID,
                    HttpContext
                );
            }
            else
            {
                EditSubject.IconLink = SubjectExists.IconLink;
            }

            mapper.Map(EditSubject, SubjectExists);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            SubjectExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                SubjectExists.UpdatedByOctaId = userId;
                if (SubjectExists.UpdatedByUserId != null)
                {
                    SubjectExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                SubjectExists.UpdatedByUserId = userId;
                if (SubjectExists.UpdatedByOctaId != null)
                {
                    SubjectExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.subject_Repository.Update(SubjectExists);
            Unit_Of_Work.SaveChanges();
            return Ok(EditSubject);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Subject" }
        )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == 0)
            {
                return BadRequest("Enter Subject ID");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (subject == null)
            {
                return NotFound();
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Subject", roleId, userId, subject);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            subject.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subject.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subject.DeletedByOctaId = userId;
                if (subject.DeletedByUserId != null)
                {
                    subject.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                subject.DeletedByUserId = userId;
                if (subject.DeletedByOctaId != null)
                {
                    subject.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.subject_Repository.Update(subject);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByStudent/{StudentId}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee", "student" },
             pages: new[] { "Subject" }
         )]
        public async Task<IActionResult> GetByStudentId(long StudentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no student with this ID");
            }

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository
                .First_Or_Default(s => s.StudentID == StudentId && s.IsDeleted != true && s.Classroom.IsDeleted != true && s.Classroom.AcademicYear.IsActive == true );

            if (studentClassroom == null)
            {
                return BadRequest("This student is not enrolled in a classroom for the current academic year.");
            }

            List<StudentClassroomSubject> studentClassroomSubject = await Unit_Of_Work.studentClassroomSubject_Repository
                .Select_All_With_IncludesById<StudentClassroomSubject>(
                    f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID && f.Subject.IsDeleted != true && f.Hide != true
                );

            if (studentClassroomSubject == null || studentClassroomSubject.Count == 0)
            {
                return NotFound();
            }

            List<long> subjectIds = studentClassroomSubject.Select(s => s.SubjectID).Distinct().ToList();
            List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(s => subjectIds.Contains(s.ID)).ToList();
            List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var subject in subjectsDTO)
            {
                if (!string.IsNullOrEmpty(subject.IconLink))
                {
                    subject.IconLink = $"{serverUrl}{subject.IconLink.Replace("\\", "/")}";
                }
            }

            return Ok(subjectsDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetClassroomAndRemedialSubjectsByStudent/{StudentId}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee", "student", "parent" }
         )]
        public async Task<IActionResult> GetClassroomAndRemedialSubjectsByStudent(long StudentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == StudentId && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no student with this ID");
            }

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository
                .First_Or_Default(s => s.StudentID == StudentId && s.IsDeleted != true && s.Classroom.IsDeleted != true && s.Classroom.Grade.Section.IsDeleted != true
                && s.Classroom.Grade.IsDeleted != true && s.Classroom.AcademicYear.IsActive == true && s.Classroom.AcademicYear.School.IsDeleted != true);

            if (studentClassroom == null)
            {
                return BadRequest("This student is not enrolled in a classroom for the current academic year.");
            }

            List<StudentClassroomSubject> studentClassroomSubject = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                    f => f.IsDeleted != true && f.StudentClassroomID == studentClassroom.ID && f.Hide != true 
                );
            
            List<RemedialClassroomStudent> remedialClassroomStudents = await Unit_Of_Work.remedialClassroomStudent_Repository.Select_All_With_IncludesById<RemedialClassroomStudent>(
                    f => f.IsDeleted != true && f.StudentID == StudentId && f.RemedialClassroom.IsDeleted != true && f.RemedialClassroom.Subject.IsDeleted != true && f.RemedialClassroom.Subject.Grade.IsDeleted != true
                    && f.RemedialClassroom.Subject.Grade.Section.IsDeleted != true && f.RemedialClassroom.AcademicYear.IsDeleted != true && f.RemedialClassroom.AcademicYear.School.IsDeleted != true
                    && f.RemedialClassroom.AcademicYear.IsActive == true,
                    query => query.Include(d => d.RemedialClassroom)
                );

            List<long> subjectIds = new List<long>();
    
            if (studentClassroomSubject != null || studentClassroomSubject.Count > 0)
            {
                subjectIds.AddRange(studentClassroomSubject.Select(ct => ct.SubjectID).Distinct().ToList()); 
            }

            if (remedialClassroomStudents != null || remedialClassroomStudents.Count > 0)
            {
                subjectIds.AddRange(remedialClassroomStudents.Select(ct => ct.RemedialClassroom.SubjectID).Distinct().ToList()); 
            }

            if (subjectIds.Count == 0)
            {
                return NotFound();
            }

            List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(s => subjectIds.Contains(s.ID)).ToList();
            List<SubjectGetDTO> subjectsDTO = mapper.Map<List<SubjectGetDTO>>(subjects); 

            return Ok(subjectsDTO);
        }
    }
}
