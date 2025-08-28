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
    public class DirectMarkController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DirectMarkController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpGet("GetBySubjectID/{subID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> GetBySubjectID(long subID, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == subID);
            if (subject == null)
            {
                return BadRequest("No subject with this id");
            }

            int totalRecords = await Unit_Of_Work.directMark_Repository
               .CountAsync(f => f.IsDeleted != true && f.SubjectID == subID);

            List<DirectMark> directMarks = await Unit_Of_Work.directMark_Repository
                .Select_All_With_IncludesById_Pagination<DirectMark>(
                    f => f.IsDeleted != true && f.SubjectID == subID,
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.SubjectWeightType.WeightType),
                    query => query.Include(d => d.DirectMarkClasses.Where(e => e.IsDeleted != true && e.Classroom.IsDeleted != true))
                        .ThenInclude(dc => dc.Classroom),
                    query => query.Include(d => d.DirectMarkClassesStudent
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Classroom),
                    query => query.Include(d => d.DirectMarkClassesStudent
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                    .ThenInclude(d => d.Student))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (directMarks == null || directMarks.Count == 0)
            {
                return NotFound();
            }

            List<DirectMarkGetDTO> AssignmentGetDTOs = mapper.Map<List<DirectMarkGetDTO>>(directMarks);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = AssignmentGetDTOs, Pagination = paginationMetadata });
        }

        /////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Assignment" }
       )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            DirectMark directMark = await Unit_Of_Work.directMark_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.Subject.Grade),
                    query => query.Include(d => d.Subject.Grade.Section.school),
                    query => query.Include(d => d.SubjectWeightType.WeightType),
                    query => query.Include(d => d.DirectMarkClasses.Where(e => e.IsDeleted != true && e.Classroom.IsDeleted != true ))
                        .ThenInclude(dc => dc.Classroom),
                    query => query.Include(d => d.DirectMarkClassesStudent
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Classroom),
                    query => query.Include(d => d.DirectMarkClassesStudent
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Student));

            if (directMark == null)
            {
                return NotFound();
            }

            DirectMarkGetDTO DTO = mapper.Map<DirectMarkGetDTO>(directMark);

            return Ok(DTO);
        }

        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Assignment" }
         )]
        public async Task<IActionResult> Add(DirectMarkAddDTO NewDirectMark)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewDirectMark == null)
            {
                return BadRequest("NewDirectMark cannot be null");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(g => g.ID == NewDirectMark.SubjectID && g.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("No subject with this ID");
            }

            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(g => g.ID == NewDirectMark.SubjectWeightTypeID && g.IsDeleted != true);
            if (subjectWeightType == null)
            {
                return BadRequest("No subject Weight Type with this ID");
            }

            if (subjectWeightType.SubjectID != NewDirectMark.SubjectID)
            {
                return BadRequest("This Subject isn't assigned to this Subject Weight Type");
            }

            DirectMark directMark = mapper.Map<DirectMark>(NewDirectMark);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            directMark.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                directMark.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                directMark.InsertedByUserId = userId;
            }

            Unit_Of_Work.directMark_Repository.Add(directMark);
            Unit_Of_Work.SaveChanges();

            List<ClassroomSubject> classroomSubjects = await Unit_Of_Work.classroomSubject_Repository.Select_All_With_IncludesById<ClassroomSubject>( 
                f => f.IsDeleted != true && f.SubjectID == NewDirectMark.SubjectID && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true);

            List<long> classids = classroomSubjects.Select(a=>a.ClassroomID).Distinct().ToList();

            if (NewDirectMark.AllClasses)
            {

                foreach (var claaId in classids)
                {
                    DirectMarkClasses directMarkClasses = new DirectMarkClasses();
                    directMarkClasses.ClassroomID = claaId;
                    directMarkClasses.DirectMarkID = directMark.ID;
                    Unit_Of_Work.directMarkClasses_Repository.Add(directMarkClasses);
                    Unit_Of_Work.SaveChanges();

                    List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(a => a.SubjectID == NewDirectMark.SubjectID && a.Hide != true 
                    && a.StudentClassroom.ClassID == claaId && a.StudentClassroom.Classroom.AcademicYear.IsActive == true && a.StudentClassroom.Classroom.AcademicYear.SchoolID==NewDirectMark.SchoolID);

                    List<long> studentClassroomids = studentClassroomSubjects.Select(a=>a.StudentClassroomID).Distinct().ToList();

                    foreach (var studentClassroomId in studentClassroomids)
                    {
                        DirectMarkClassesStudent directMarkClassesStudent = new DirectMarkClassesStudent();
                        directMarkClassesStudent.StudentClassroomID = studentClassroomId;
                        directMarkClassesStudent.DirectMarkID = directMark.ID;
                        directMarkClassesStudent.Degree = 0;
                        Unit_Of_Work.directMarkClassesStudent_Repository.Add(directMarkClassesStudent);
                        Unit_Of_Work.SaveChanges();
                    }
                }

            }
            else
            {
                foreach (var claaId in NewDirectMark.classids)
                {
                    if (!classids.Contains(claaId))
                    {
                        return BadRequest("class shoul be take this subject");
                    }

                    DirectMarkClasses directMarkClasses = new DirectMarkClasses();
                    directMarkClasses.ClassroomID = claaId;
                    directMarkClasses.DirectMarkID = directMark.ID;
                    Unit_Of_Work.directMarkClasses_Repository.Add(directMarkClasses);
                    Unit_Of_Work.SaveChanges();

                    List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(a => a.SubjectID == NewDirectMark.SubjectID && a.Hide != true
                    && a.StudentClassroom.ClassID == claaId && a.StudentClassroom.Classroom.AcademicYear.IsActive == true && a.StudentClassroom.Classroom.AcademicYear.SchoolID == NewDirectMark.SchoolID);

                    List<long> studentClassroomids = studentClassroomSubjects.Select(a => a.StudentClassroomID).Distinct().ToList();

                    foreach (var studentClassroomId in studentClassroomids)
                    {
                        DirectMarkClassesStudent directMarkClassesStudent = new DirectMarkClassesStudent();
                        directMarkClassesStudent.StudentClassroomID = studentClassroomId;
                        directMarkClassesStudent.DirectMarkID = directMark.ID;
                        directMarkClassesStudent.Degree = 0;
                        Unit_Of_Work.directMarkClassesStudent_Repository.Add(directMarkClassesStudent);
                        Unit_Of_Work.SaveChanges();
                    }
                }
            }

            return Ok(NewDirectMark);
        }

        /////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Assignment" }
        )]
        public IActionResult Edit(DirectMarkEditDTO NewDirectMark)
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

            DirectMark directMark = Unit_Of_Work.directMark_Repository.First_Or_Default(s => s.ID == NewDirectMark.ID && s.IsDeleted != true);
            if (directMark == null)
            {
                return NotFound("No directMark with this ID");
            }

            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(g => g.ID == NewDirectMark.SubjectWeightTypeID && g.IsDeleted != true);
            if (subjectWeightType == null)
            {
                return BadRequest("No subject Weight Type with this ID");
            }

            if (subjectWeightType.SubjectID != directMark.SubjectID)
            {
                return BadRequest("This Subject isn't assigned to this Subject Weight Type");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Academic Years", roleId, userId, directMark);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewDirectMark, directMark);


            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            directMark.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                directMark.UpdatedByOctaId = userId;
                if (directMark.UpdatedByUserId != null)
                {
                    directMark.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                directMark.UpdatedByUserId = userId;
                if (directMark.UpdatedByOctaId != null)
                {
                    directMark.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.directMark_Repository.Update(directMark);
            Unit_Of_Work.SaveChanges();

            List<DirectMarkClasses> existingClasses = Unit_Of_Work.directMarkClasses_Repository.FindBy(s => s.DirectMarkID == directMark.ID && s.IsDeleted != true);
            List<long> existingClassIds = existingClasses.Select(x => x.ClassroomID).Distinct().ToList();
            List<long> updatedClassIds = NewDirectMark.classids ?? new List<long>();

            var classesToAdd = updatedClassIds.Except(existingClassIds).ToList();
            var classesToDelete = existingClassIds.Except(updatedClassIds).ToList();

            // Add new classes and related students
            foreach (var classId in classesToAdd)
            {
                DirectMarkClasses newClass = new DirectMarkClasses
                {
                    ClassroomID = classId,
                    DirectMarkID = directMark.ID
                };
                Unit_Of_Work.directMarkClasses_Repository.Add(newClass);
                Unit_Of_Work.SaveChanges();

                List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                    a => a.SubjectID == directMark.SubjectID &&
                         a.Hide != true &&
                         a.StudentClassroom.ClassID == classId &&
                         a.StudentClassroom.Classroom.AcademicYear.IsActive == true &&
                         a.StudentClassroom.Classroom.AcademicYear.SchoolID == NewDirectMark.SchoolID
                );

                foreach (var studentClassroomId in studentClassroomSubjects.Select(a => a.StudentClassroomID).Distinct())
                {
                    DirectMarkClassesStudent student = new DirectMarkClassesStudent
                    {
                        StudentClassroomID = studentClassroomId,
                        DirectMarkID = directMark.ID,
                        Degree = 0
                    };
                    Unit_Of_Work.directMarkClassesStudent_Repository.Add(student);
                }
                Unit_Of_Work.SaveChanges();
            }


            // Delete removed classes and related students
            foreach (var classId in classesToDelete)
            {
                var classToRemove = existingClasses.FirstOrDefault(c => c.ClassroomID == classId);
                if (classToRemove != null)
                {
                    classToRemove.IsDeleted = true;
                    Unit_Of_Work.directMarkClasses_Repository.Update(classToRemove);
                }

                var studentsToRemove = Unit_Of_Work.directMarkClassesStudent_Repository.FindBy(
                    s => s.DirectMarkID == directMark.ID &&
                         s.StudentClassroom.ClassID == classId &&
                         s.IsDeleted != true
                );
                foreach (var student in studentsToRemove)
                {
                    student.IsDeleted = true;
                    Unit_Of_Work.directMarkClassesStudent_Repository.Update(student);
                }

                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewDirectMark);
        }

        /////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             allowDelete: 1,
             pages: new[] { "Academic Years" }
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

            if (id == null)
            {
                return BadRequest("id cannot be null");
            }
            DirectMark directMark = Unit_Of_Work.directMark_Repository.Select_By_Id(id);

            if (directMark == null || directMark.IsDeleted == true)
            {
                return NotFound("No directMark with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Academic Years", roleId, userId, directMark);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            directMark.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            directMark.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                directMark.DeletedByOctaId = userId;
                if (directMark.DeletedByUserId != null)
                {
                    directMark.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                directMark.DeletedByUserId = userId;
                if (directMark.DeletedByOctaId != null)
                {
                    directMark.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.directMark_Repository.Update(directMark);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
