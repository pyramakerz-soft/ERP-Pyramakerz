using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ClassroomSubjectController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory; 
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomSubjectController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpPost("Generate/{classId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Subject" }
        )]
        public IActionResult Generate(long classId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
         
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.ID == classId && d.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("No Class with this ID");
            }

            List<ClassroomSubject> classroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(d => d.IsDeleted != true && d.ClassroomID == classId);

            if(classroomSubjects != null &&  classroomSubjects.Count() > 0)
            {
                return BadRequest("You Have Already Generated it");
            }

            List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(d => d.IsDeleted != true && d.GradeID == classroom.GradeID);
            
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (var subject in subjects)
            {
                ClassroomSubject classroomSubject = new ClassroomSubject();
                classroomSubject.Hide = false;
                classroomSubject.ClassroomID = classId;
                classroomSubject.SubjectID = subject.ID;

                classroomSubject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    classroomSubject.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    classroomSubject.InsertedByUserId = userId;
                }

                Unit_Of_Work.classroomSubject_Repository.Add(classroomSubject);
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
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
                    f => f.IsDeleted != true && f.ClassroomID == classId,
                    query => query.Include(emp => emp.Subject),
                    query => query.Include(emp => emp.Classroom),
                    query => query.Include(emp => emp.Teacher),
                    query => query.Include(emp => emp.ClassroomSubjectCoTeachers.Where(c => c.IsDeleted != true)).ThenInclude(c => c.CoTeacher)
                    );

            if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                return NotFound();
            }

            List<ClassroomSubjectGetDTO> classroomSubjectsDTO = mapper.Map<List<ClassroomSubjectGetDTO>>(classroomSubjects);
             
            return Ok(classroomSubjectsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Subject" }
        )]
        public async Task<IActionResult> GetByIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            ClassroomSubject classroomSubject = await Unit_Of_Work.classroomSubject_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(emp => emp.Subject),
                    query => query.Include(emp => emp.Classroom),
                    query => query.Include(emp => emp.Teacher),
                    query => query.Include(emp => emp.ClassroomSubjectCoTeachers.Where(c => c.IsDeleted != true)).ThenInclude(c => c.CoTeacher)
                    );

            if (classroomSubject == null)
            {
                return NotFound();
            }

            ClassroomSubjectGetDTO classroomSubjectsDTO = mapper.Map<ClassroomSubjectGetDTO>(classroomSubject);

            return Ok(classroomSubjectsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Classroom Subject" }
        )]
        public IActionResult Edit(ClassroomSubjectPutDTO EditedClassroomSubject)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (EditedClassroomSubject == null)
            {
                return BadRequest("Classroom Subject cannot be null");
            }

            ClassroomSubject ClassroomSubjectExists = Unit_Of_Work.classroomSubject_Repository.First_Or_Default(g => g.ID == EditedClassroomSubject.ID && g.IsDeleted != true);
            if (ClassroomSubjectExists == null)
            {
                return NotFound("No Classroom Subject with this ID");
            }
             
            if (EditedClassroomSubject.TeacherID != 0 && EditedClassroomSubject.TeacherID != null)
            {
                Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(g => g.ID == EditedClassroomSubject.TeacherID && g.IsDeleted != true);
                if (employee == null)
                {
                    return BadRequest("No Teacher with this ID");
                }
            }
            else
            {
                EditedClassroomSubject.TeacherID = null;
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Subject", roleId, userId, ClassroomSubjectExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            List<ClassroomSubjectCoTeacher> classroomSubjectCoTeachers = Unit_Of_Work.classroomSubjectCoTeacher_Repository.FindBy(
                d=>d.IsDeleted != true && d.ClassroomSubjectID == EditedClassroomSubject.ID);

            List<long> existingCoTeacherIDs;
            List<long> newCoTeacherIDs;

            if (EditedClassroomSubject.CoTeacherIDs != null && EditedClassroomSubject.CoTeacherIDs.Count > 0)
            {
                newCoTeacherIDs = EditedClassroomSubject.CoTeacherIDs; 
            }
            else
            {
                newCoTeacherIDs = new List<long>();
            }

            if ( classroomSubjectCoTeachers != null && classroomSubjectCoTeachers.Count > 0)
            {
                existingCoTeacherIDs = classroomSubjectCoTeachers
                    .Select(c => c.CoTeacherID)
                    .ToList();
            }
            else
            {
                existingCoTeacherIDs = new List<long>();
            }

            var idsToAdd = newCoTeacherIDs.Except(existingCoTeacherIDs).ToList();
            var idsToRemove = existingCoTeacherIDs.Except(newCoTeacherIDs).ToList();
             
            foreach (long id in idsToAdd)
            {
                Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(g => g.ID == id && g.IsDeleted != true);
                if (employee == null)
                {
                    return BadRequest("No Co-Teacher with this ID");
                }

                ClassroomSubjectCoTeacher newCoTeacher = new ClassroomSubjectCoTeacher
                {
                    CoTeacherID = id,
                    ClassroomSubjectID = EditedClassroomSubject.ID 
                };

                newCoTeacher.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    newCoTeacher.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    newCoTeacher.InsertedByUserId = userId;
                }

                Unit_Of_Work.classroomSubjectCoTeacher_Repository.Add(newCoTeacher);
            }

            foreach (long id in idsToRemove)
            {
                ClassroomSubjectCoTeacher itemToRemove = Unit_Of_Work.classroomSubjectCoTeacher_Repository.First_Or_Default(x => x.CoTeacherID == id && x.IsDeleted != true && x.ClassroomSubjectID == EditedClassroomSubject.ID);
                
                if (itemToRemove != null)
                {
                    itemToRemove.IsDeleted = true;
                    itemToRemove.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        itemToRemove.DeletedByOctaId = userId;
                        if (itemToRemove.DeletedByUserId != null)
                        {
                            itemToRemove.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        itemToRemove.DeletedByUserId = userId;
                        if (itemToRemove.DeletedByOctaId != null)
                        {
                            itemToRemove.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.classroomSubjectCoTeacher_Repository.Update(itemToRemove);
                }
            }
            Unit_Of_Work.SaveChanges();

            mapper.Map(EditedClassroomSubject, ClassroomSubjectExists); 

            ClassroomSubjectExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                ClassroomSubjectExists.UpdatedByOctaId = userId;
                if (ClassroomSubjectExists.UpdatedByUserId != null)
                {
                    ClassroomSubjectExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                ClassroomSubjectExists.UpdatedByUserId = userId;
                if (ClassroomSubjectExists.UpdatedByOctaId != null)
                {
                    ClassroomSubjectExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.classroomSubject_Repository.Update(ClassroomSubjectExists);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        /////////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpPut("IsSubjectHide")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Classroom Subject" }
        )]
        public IActionResult IsSubjectHide(ClassroomSubjectHidePutDTO EditedClassroomSubjectHide)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (EditedClassroomSubjectHide == null)
            {
                return BadRequest("Classroom Subject cannot be null");
            }

            ClassroomSubject ClassroomSubjectExists = Unit_Of_Work.classroomSubject_Repository.First_Or_Default(g => g.ID == EditedClassroomSubjectHide.ID && g.IsDeleted != true);
            if (ClassroomSubjectExists == null)
            {
                return NotFound("No Classroom Subject with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Subject", roleId, userId, ClassroomSubjectExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            } 
            
            mapper.Map(EditedClassroomSubjectHide, ClassroomSubjectExists); 

            ClassroomSubjectExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                ClassroomSubjectExists.UpdatedByOctaId = userId;
                if (ClassroomSubjectExists.UpdatedByUserId != null)
                {
                    ClassroomSubjectExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                ClassroomSubjectExists.UpdatedByUserId = userId;
                if (ClassroomSubjectExists.UpdatedByOctaId != null)
                {
                    ClassroomSubjectExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.classroomSubject_Repository.Update(ClassroomSubjectExists);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
    }
}
