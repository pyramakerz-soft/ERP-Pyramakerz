using AutoMapper;
using LMS_CMS_BL.DTO;
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
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

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

            List<Subject> subjects = Unit_Of_Work.subject_Repository.FindBy(d => d.IsDeleted != true && d.GradeID == classroom.GradeID);

            var classroomSubjectIds = new HashSet<long>(classroomSubjects.Select(cs => cs.SubjectID));
            var subjectIds = new HashSet<long>(subjects.Select(s => s.ID));

            if (classroomSubjectIds.SetEquals(subjectIds))
            {
                return BadRequest("You Have Already Generated it");
            }
            else if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                if (subjects != null && subjects.Count > 0)
                {
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
                }
            } else
            {
                if (subjects != null && subjects.Count > 0)
                {
                    foreach (var subject in subjects)
                    {
                        bool subjectExists = classroomSubjects.Any(cs => cs.SubjectID == subject.ID);
                        if (!subjectExists)
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
                    }
                }
                if (classroomSubjects != null && classroomSubjects.Count > 0)
                {
                    foreach (var classroomSubject in classroomSubjects)
                    {
                        bool classroomSubjectExists = subjects.Any(cs => cs.ID == classroomSubject.SubjectID);
                        if (!classroomSubjectExists)
                        { 
                            classroomSubject.IsDeleted = true;
                            classroomSubject.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                classroomSubject.DeletedByOctaId = userId;
                                if (classroomSubject.DeletedByUserId != null)
                                {
                                    classroomSubject.DeletedByUserId = null;
                                }
                            }
                            else if (userTypeClaim == "employee")
                            {
                                classroomSubject.DeletedByUserId = userId;
                                if (classroomSubject.DeletedByOctaId != null)
                                {
                                    classroomSubject.DeletedByOctaId = null;
                                }
                            }

                            Unit_Of_Work.classroomSubject_Repository.Update(classroomSubject);
                        }
                    }
                }
            }

            Unit_Of_Work.SaveChanges();

            List<ClassroomSubject> classroomSubjectsAfterAddingOrRemoving = Unit_Of_Work.classroomSubject_Repository.FindBy(d => d.IsDeleted != true && d.ClassroomID == classId);
            List<StudentClassroom> studentClassrooms = Unit_Of_Work.studentClassroom_Repository.FindBy(d => d.IsDeleted != true && d.ClassID == classId);

            if (studentClassrooms != null && studentClassrooms.Count > 0)
            {
                foreach (var studentClassroom in studentClassrooms)
                {
                    List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                        d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID
                        );
                     
                    // If studentClassroomSubjects has subjects That Doesn't Exists in classroomSubjectsAfterAddingOrRemoving, Remove Them
                    if (studentClassroomSubjects != null && studentClassroomSubjects.Count > 0)
                    {
                        foreach (var studentClassroomSubject in studentClassroomSubjects)
                        {
                            bool SubjectExists = classroomSubjectsAfterAddingOrRemoving.Any(cs => cs.SubjectID == studentClassroomSubject.SubjectID);
                            if (!SubjectExists)
                            {
                                studentClassroomSubject.IsDeleted = true;
                                studentClassroomSubject.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                if (userTypeClaim == "octa")
                                {
                                    studentClassroomSubject.DeletedByOctaId = userId;
                                    if (studentClassroomSubject.DeletedByUserId != null)
                                    {
                                        studentClassroomSubject.DeletedByUserId = null;
                                    }
                                }
                                else if (userTypeClaim == "employee")
                                {
                                    studentClassroomSubject.DeletedByUserId = userId;
                                    if (studentClassroomSubject.DeletedByOctaId != null)
                                    {
                                        studentClassroomSubject.DeletedByOctaId = null;
                                    }
                                }

                                Unit_Of_Work.studentClassroomSubject_Repository.Update(studentClassroomSubject);

                                //List<AssignmentStudent> assignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(
                                //    d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Assignment.SubjectID == studentClassroomSubject.SubjectID
                                //    );
                                //if(assignmentStudents != null)
                                //{
                                //    foreach (var item in assignmentStudents)
                                //    {
                                //        item.IsDeleted = true;
                                //        item.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                //        if (userTypeClaim == "octa")
                                //        {
                                //            item.DeletedByOctaId = userId;
                                //            if (item.DeletedByUserId != null)
                                //            {
                                //                item.DeletedByUserId = null;
                                //            }
                                //        }
                                //        else if (userTypeClaim == "employee")
                                //        {
                                //            item.DeletedByUserId = userId;
                                //            if (item.DeletedByOctaId != null)
                                //            {
                                //                item.DeletedByOctaId = null;
                                //            }
                                //        }

                                //        Unit_Of_Work.assignmentStudent_Repository.Update(item);
                                //    }
                                //}
                            }
                        }
                    }

                    // If classroomSubjectsAfterAddingOrRemoving has subjects That Doesn't Exists in studentClassroomSubjects, Add Them
                    if (classroomSubjectsAfterAddingOrRemoving != null && classroomSubjectsAfterAddingOrRemoving.Count > 0)
                    {
                        foreach (var classroomSubjectAfter in classroomSubjectsAfterAddingOrRemoving)
                        {
                            bool SubjectExists = studentClassroomSubjects.Any(cs => cs.SubjectID == classroomSubjectAfter.SubjectID);
                            if (!SubjectExists)
                            {
                                if(classroomSubjectAfter.Hide != true)
                                {
                                    StudentClassroomSubject studentClassroomSubject = new StudentClassroomSubject
                                    {
                                        StudentClassroomID = studentClassroom.ID,
                                        SubjectID = classroomSubjectAfter.SubjectID
                                    };

                                    studentClassroomSubject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                    if (userTypeClaim == "octa")
                                    {
                                        studentClassroomSubject.InsertedByOctaId = userId;
                                    }
                                    else if (userTypeClaim == "employee")
                                    {
                                        studentClassroomSubject.InsertedByUserId = userId;
                                    }

                                    Unit_Of_Work.studentClassroomSubject_Repository.Add(studentClassroomSubject);

                                    //List<Assignment> assignments = Unit_Of_Work.assignment_Repository.FindBy(d => d.IsDeleted != true && d.IsSpecificStudents != true && d.SubjectID == classroomSubjectAfter.SubjectID);

                                    //foreach (Assignment assignment in assignments)
                                    //{
                                    //    AssignmentStudent newAssignmentStudent = new AssignmentStudent();
                                    //    newAssignmentStudent.AssignmentID = assignment.ID;
                                    //    newAssignmentStudent.StudentClassroomID = studentClassroom.ID;
                                    //    newAssignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                    //    if (userTypeClaim == "octa")
                                    //    {
                                    //        newAssignmentStudent.InsertedByOctaId = userId;
                                    //    }
                                    //    else if (userTypeClaim == "employee")
                                    //    {
                                    //        newAssignmentStudent.InsertedByUserId = userId;
                                    //    }

                                    //    Unit_Of_Work.assignmentStudent_Repository.Add(newAssignmentStudent); 
                                    //}
                                }
                            }
                        }
                    }
                }
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

            List<ClassroomSubjectGetDTO> classroomSubjectsDTO = mapper.Map<List<ClassroomSubjectGetDTO>>(classroomSubjects);
             
            return Ok(classroomSubjectsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByEmployee/{EmpId}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Classroom Subject" }
         )]
        public async Task<IActionResult> GetByEmployeeAsync(long EmpId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var classroomSubjects = await Unit_Of_Work.classroomSubject_Repository
                .Select_All_With_IncludesById<ClassroomSubject>(
                    f => f.IsDeleted != true && f.TeacherID == EmpId && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true,
                    q => q.Include(cs => cs.Subject),
                    q => q.Include(cs => cs.Classroom),
                    q => q.Include(cs => cs.Teacher),
                    q => q.Include(cs => cs.ClassroomSubjectCoTeachers.Where(c => c.IsDeleted != true)).ThenInclude(c => c.CoTeacher)
                );

            if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                return NotFound();
            }

            var classroomSubjectsDTO = mapper.Map<List<ClassroomSubjectGetDTO>>(classroomSubjects);

            // Group by ClassroomID and build result
            var grouped = classroomSubjectsDTO
                .GroupBy(x => x.ClassroomID)
                .Select(g => new ClassroomWithSubjectsDTO
                {
                    ClassroomID = g.Key,
                    ClassroomName = classroomSubjects
                        .FirstOrDefault(cs => cs.ClassroomID == g.Key)?.Classroom?.Name ?? "",
                    Subjects = g.ToList()
                })
                .ToList();

            return Ok(grouped);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetBySubject/{SubjectId}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Classroom Subject" }
         )]
        public async Task<IActionResult> GetBySubject(long SubjectId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var classroomSubjects = await Unit_Of_Work.classroomSubject_Repository
                .Select_All_With_IncludesById<ClassroomSubject>(
                    f => f.IsDeleted != true && f.SubjectID == SubjectId && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true && f.Teacher.IsDeleted != true,
                    q => q.Include(cs => cs.Teacher)
                );

            if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                return NotFound();
            }

            List<long?> classroomSubjectsIds= classroomSubjects.Select(s=>s.TeacherID).Distinct().ToList();

            if (classroomSubjectsIds == null || classroomSubjectsIds.Count == 0)
            {
                return NotFound();
            }
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(s => classroomSubjectsIds.Contains(s.ID));
            List<Employee_GetDTO> DTO = mapper.Map<List<Employee_GetDTO>>(employees);
            return Ok(DTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByEmployeeCoTeacher/{EmpId}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Classroom Subject" }
         )]
        public async Task<IActionResult> GetByEmployeeCoTeacherAsync(long EmpId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ClassroomSubjectCoTeacher> classroomSubjectCoTeacher = Unit_Of_Work.classroomSubjectCoTeacher_Repository.FindBy(
                s => s.CoTeacherID == EmpId && s.IsDeleted != true && s.CoTeacher.IsDeleted != true && s.ClassroomSubject.IsDeleted != true 
                && s.ClassroomSubject.Classroom.IsDeleted != true && s.ClassroomSubject.Subject.IsDeleted != true);
            List<long> subjectIds = classroomSubjectCoTeacher
                .Select(v => v.ClassroomSubjectID)
                .Distinct()
                .ToList();

           var classroomSubjects = await Unit_Of_Work.classroomSubject_Repository
                .Select_All_With_IncludesById<ClassroomSubject>(
                    f => f.IsDeleted != true && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true && subjectIds.Contains( f.ID) ,
                    q => q.Include(cs => cs.Subject),
                    q => q.Include(cs => cs.Classroom)
                );

            if (classroomSubjects == null || classroomSubjects.Count == 0)
            {
                return NotFound();
            }

            var classroomSubjectsDTO = mapper.Map<List<ClassroomSubjectGetDTO>>(classroomSubjects);

            // Group by ClassroomID and build result
            var grouped = classroomSubjectsDTO
                .GroupBy(x => x.ClassroomID)
                .Select(g => new ClassroomWithSubjectsDTO
                {
                    ClassroomID = g.Key,
                    ClassroomName = classroomSubjects
                        .FirstOrDefault(cs => cs.ClassroomID == g.Key)?.Classroom?.Name ?? "",
                    Subjects = g.ToList()
                })
                .ToList();

            return Ok(grouped);
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
                    f => f.IsDeleted != true && f.ID == id && f.Classroom.IsDeleted != true && f.Subject.IsDeleted != true,
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

        [HttpGet("GetClassBySubjectIDWithStudentsIncluded/{SubId}/{yearID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Students", "Assignment" }
        )]
        public async Task<IActionResult> GetBySubjectIDWithStudentsIncluded(long SubId, long yearID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
             
            List<ClassroomSubject> classroomSubjects = await Unit_Of_Work.classroomSubject_Repository
                .Select_All_With_IncludesById<ClassroomSubject>(
                    f => f.IsDeleted != true && f.SubjectID == SubId && f.Classroom.AcademicYearID == yearID && f.Classroom.IsDeleted != true && f.Hide != true && f.Subject.IsDeleted != true,
                    query => query.Include(cs => cs.Classroom).ThenInclude(c => c.StudentClassrooms).ThenInclude(sc => sc.StudentClassroomSubjects.Where(d => d.IsDeleted != true)),
                    query => query.Include(cs => cs.Classroom).ThenInclude(c => c.StudentClassrooms).ThenInclude(sc => sc.Student)
                );

            if (classroomSubjects == null)
            {
                return NotFound("No Classroom Subjects with this Subject ID");
            }

            foreach (var classroomSubject in classroomSubjects)
            {
                classroomSubject.Classroom.StudentClassrooms = classroomSubject.Classroom.StudentClassrooms
                    .Where(sc =>
                        sc.IsDeleted != true &&
                        sc.StudentClassroomSubjects.Any(scs =>
                            scs.StudentClassroom.Student.IsDeleted != true &&
                            scs.IsDeleted != true &&
                            scs.SubjectID == SubId &&
                            scs.Hide != true
                        )
                    )
                    .Select(sc =>
                    { 
                        sc.StudentClassroomSubjects = sc.StudentClassroomSubjects
                            .Where(scs =>
                                scs.StudentClassroom.Student.IsDeleted != true &&
                                scs.IsDeleted != true &&
                                scs.SubjectID == SubId &&
                                scs.Hide != true
                            )
                            .ToList();

                        return sc;
                    })
                    .ToList();      
            }

            List<StudentClassWhenSubject> studentClassWhenSubjects = new List<StudentClassWhenSubject> ();
            foreach (var classroomSubject in classroomSubjects)
            {
                StudentClassWhenSubject studentClassWhenSubject = new StudentClassWhenSubject ();
                studentClassWhenSubject.ClassroomID = classroomSubject.ClassroomID;
                studentClassWhenSubject.ClassroomName = classroomSubject.Classroom.Name;
                foreach (var classroomStudent in classroomSubject.Classroom.StudentClassrooms)
                {
                    StudentClassroomGetDTO studentClassroomGetDTO = new StudentClassroomGetDTO ();
                    studentClassroomGetDTO.ID = classroomStudent.ID;
                    studentClassroomGetDTO.StudentID = classroomStudent.Student.ID;
                    studentClassroomGetDTO.StudentEnglishName = classroomStudent.Student.en_name;
                    studentClassroomGetDTO.StudentArabicName = classroomStudent.Student.ar_name;
                    studentClassroomGetDTO.ClassID = classroomStudent.ClassID;
                    studentClassroomGetDTO.ClassName = classroomStudent.Classroom.Name;

                    studentClassWhenSubject.StudentClassrooms.Add(studentClassroomGetDTO);
                }
                studentClassWhenSubjects.Add(studentClassWhenSubject);
            }
             
            return Ok(studentClassWhenSubjects);
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

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Classroom Subject" }
        )]
        public IActionResult AddCoTeacher(ClassroomSubjectCoTeacherGetDTO NewCoTeacher)
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

            if (NewCoTeacher == null)
            {
                return BadRequest("CoTeacher cannot be null");
            }

            ClassroomSubject classroomSubject = Unit_Of_Work.classroomSubject_Repository.First_Or_Default(s=>s.ID== NewCoTeacher.ClassroomSubjectID && s.IsDeleted!= true);
            if(classroomSubject == null)
            {
                return BadRequest("ClassroomSubject not found");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == NewCoTeacher.CoTeacherID && s.IsDeleted != true);
            if (employee == null)
            {
                return BadRequest("employee not found");
            }

            ClassroomSubjectCoTeacher classroomSubjectCoTeacher = Unit_Of_Work.classroomSubjectCoTeacher_Repository.First_Or_Default(s=>s.ClassroomSubjectID== NewCoTeacher.ClassroomSubjectID && s.CoTeacherID==NewCoTeacher.CoTeacherID);
            if(classroomSubjectCoTeacher != null)
            {
                if(classroomSubjectCoTeacher.IsDeleted == true)
                {
                    classroomSubjectCoTeacher.IsDeleted=null;
                    Unit_Of_Work.classroomSubjectCoTeacher_Repository.Update(classroomSubjectCoTeacher);
                    Unit_Of_Work.SaveChanges();
                }
                else
                {
                    return Ok();
                }

            }
            else
            {
                classroomSubjectCoTeacher = new ClassroomSubjectCoTeacher();
                classroomSubjectCoTeacher.ClassroomSubjectID = NewCoTeacher.ClassroomSubjectID;
                classroomSubjectCoTeacher.CoTeacherID=NewCoTeacher.CoTeacherID;
                Unit_Of_Work.classroomSubjectCoTeacher_Repository.Add(classroomSubjectCoTeacher);
                Unit_Of_Work.SaveChanges();
            }

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

            // If Not Hide, Add the subject to students in class and add the assignment
            if (ClassroomSubjectExists.Hide == true && EditedClassroomSubjectHide.Hide == false)
            {
                //List<Assignment> assignments = Unit_Of_Work.assignment_Repository.FindBy(d => d.IsDeleted != true && d.IsSpecificStudents != true);
                
                List<StudentClassroom> studentClassrooms = Unit_Of_Work.studentClassroom_Repository.FindBy(d => d.ClassID == ClassroomSubjectExists.ClassroomID && d.IsDeleted != true);
                foreach (var studentClassroom in studentClassrooms)
                {
                   StudentClassroomSubject studentClassroomSubject = new StudentClassroomSubject
                   {
                       StudentClassroomID = studentClassroom.ID,
                       SubjectID = ClassroomSubjectExists.SubjectID
                   };

                    studentClassroomSubject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        studentClassroomSubject.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        studentClassroomSubject.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.studentClassroomSubject_Repository.Add(studentClassroomSubject);
                    
                    
                    //if(assignments != null)
                    //{
                    //    foreach (var assignment in assignments)
                    //    {
                    //        AssignmentStudent newAssignmentStudent = new AssignmentStudent();
                    //        newAssignmentStudent.AssignmentID = assignment.ID;
                    //        newAssignmentStudent.StudentClassroomID = studentClassroom.ID;
                    //        newAssignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    //        if (userTypeClaim == "octa")
                    //        {
                    //            newAssignmentStudent.InsertedByOctaId = userId;
                    //        }
                    //        else if (userTypeClaim == "employee")
                    //        {
                    //            newAssignmentStudent.InsertedByUserId = userId;
                    //        }

                    //        Unit_Of_Work.assignmentStudent_Repository.Add(newAssignmentStudent);
                    //    }
                    //}
                }
            }

            // If Hide, Remove subject from students and remove assignments
            if (ClassroomSubjectExists.Hide == false && EditedClassroomSubjectHide.Hide == true)
            {
                List<StudentClassroom> studentClassrooms = Unit_Of_Work.studentClassroom_Repository.FindBy(d => d.ClassID == ClassroomSubjectExists.ClassroomID && d.IsDeleted != true);
                foreach (var studentClassroom in studentClassrooms)
                {
                    StudentClassroomSubject studentClassroomSubject = Unit_Of_Work.studentClassroomSubject_Repository.First_Or_Default(
                        d => d.StudentClassroomID == studentClassroom.ID && d.IsDeleted != true && d.SubjectID == ClassroomSubjectExists.SubjectID
                        );
                     
                    if(studentClassroomSubject != null)
                    {
                        studentClassroomSubject.IsDeleted = true;
                        studentClassroomSubject.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            studentClassroomSubject.DeletedByOctaId = userId;
                            if (studentClassroomSubject.DeletedByUserId != null)
                            {
                                studentClassroomSubject.DeletedByUserId = null;
                            }
                        }
                        else if (userTypeClaim == "employee")
                        {
                            studentClassroomSubject.DeletedByUserId = userId;
                            if (studentClassroomSubject.DeletedByOctaId != null)
                            {
                                studentClassroomSubject.DeletedByOctaId = null;
                            }
                        }

                        Unit_Of_Work.studentClassroomSubject_Repository.Update(studentClassroomSubject);

                        //List<AssignmentStudent> assignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID);
                        //if(assignmentStudents != null)
                        //{
                        //    foreach (AssignmentStudent assignmentStudent in assignmentStudents)
                        //    {
                        //        assignmentStudent.IsDeleted = true;
                        //        assignmentStudent.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        //        if (userTypeClaim == "octa")
                        //        {
                        //            assignmentStudent.DeletedByOctaId = userId;
                        //            if (assignmentStudent.DeletedByUserId != null)
                        //            {
                        //                assignmentStudent.DeletedByUserId = null;
                        //            }
                        //        }
                        //        else if (userTypeClaim == "employee")
                        //        {
                        //            assignmentStudent.DeletedByUserId = userId;
                        //            if (assignmentStudent.DeletedByOctaId != null)
                        //            {
                        //                assignmentStudent.DeletedByOctaId = null;
                        //            }
                        //        }
                        //        Unit_Of_Work.assignmentStudent_Repository.Update(assignmentStudent);
                        //    }
                        //}
                    }
                }
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
